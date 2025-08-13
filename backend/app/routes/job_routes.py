from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from models.job_model import JobDescription
from services.document_service import document_processor
from services.embedding_service import embedding_service
from config.app_config import AppConfig

job_bp = Blueprint('jobs', __name__)

def save_uploaded_file(file, folder='job_descriptions'):
    """Save uploaded file and return file path"""
    try:
        if not file or file.filename == '':
            return None, 'No file selected'
        
        if not AppConfig.allowed_file(file.filename):
            return None, 'File type not allowed'
        
        filename = secure_filename(file.filename)
        # Add timestamp to avoid filename conflicts
        import time
        timestamp = str(int(time.time()))
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext}"
        
        # Create upload directory if it doesn't exist
        upload_path = os.path.join(AppConfig.UPLOAD_FOLDER, folder)
        os.makedirs(upload_path, exist_ok=True)
        
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        
        return file_path, None
    except Exception as e:
        return None, f'Error saving file: {str(e)}'

@job_bp.route('', methods=['POST'])
@jwt_required()
def create_job_description():
    """Create a new job description"""
    try:
        user_id = get_jwt_identity()
        
        # Handle both form data and JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Form data with potential file upload
            title = request.form.get('title', '').strip()
            company = request.form.get('company', '').strip()
            description = request.form.get('description', '').strip()
            requirements = request.form.get('requirements', '').strip()
            
            file_path = None
            
            # Check if file is uploaded
            if 'job_file' in request.files:
                file = request.files['job_file']
                if file.filename:
                    file_path, error = save_uploaded_file(file, 'job_descriptions')
                    if error:
                        return jsonify({'error': error}), 400
                    
                    # Extract text from file if no description provided
                    if not description:
                        file_extension = os.path.splitext(file.filename)[1].lower().lstrip('.')
                        extracted_text = document_processor.extract_text(file_path, file_extension)
                        if extracted_text:
                            description = extracted_text
        else:
            # JSON data
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            title = data.get('title', '').strip()
            company = data.get('company', '').strip()
            description = data.get('description', '').strip()
            requirements = data.get('requirements', '').strip()
            file_path = None
        
        # Validate required fields
        if not title:
            return jsonify({'error': 'Job title is required'}), 400
        
        if not company:
            return jsonify({'error': 'Company name is required'}), 400
        
        if not description:
            return jsonify({'error': 'Job description is required'}), 400
        
        # Generate embedding for the job description
        full_text = f"{title} {company} {description}"
        if requirements:
            full_text += f" {requirements}"
        
        embedding = embedding_service.generate_embedding(full_text)
        
        # Create job description record
        job = JobDescription.create(
            user_id=user_id,
            title=title,
            company=company,
            description=description,
            requirements=requirements,
            file_path=file_path,
            embedding=embedding
        )
        
        if not job:
            return jsonify({'error': 'Failed to create job description'}), 500
        
        return jsonify({
            'message': 'Job description created successfully',
            'job': {
                'id': job['id'],
                'title': job['title'],
                'company': job['company'],
                'description': job['description'],
                'requirements': job['requirements'],
                'status': job['status'],
                'has_embedding': embedding is not None,
                'created_at': job['created_at'].isoformat() if job['created_at'] else None
            }
        }), 201
        
    except Exception as e:
        print(f"Create job description error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('', methods=['GET'])
@jwt_required()
def get_job_descriptions():
    """Get job descriptions for the current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 per page
        search = request.args.get('search', '').strip()
        
        offset = (page - 1) * limit
        
        if search:
            jobs = JobDescription.search(search, user_id, limit)
        else:
            jobs = JobDescription.find_by_user_id(user_id, limit, offset)
        
        return jsonify({
            'jobs': jobs,
            'page': page,
            'limit': limit,
            'search': search if search else None
        }), 200
        
    except Exception as e:
        print(f"Get job descriptions error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_job_descriptions():
    """Get all active job descriptions (for admin/matching purposes)"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 50)), 100)  # Max 100 per page
        
        offset = (page - 1) * limit
        
        jobs = JobDescription.get_all_active(limit, offset)
        
        # Remove user_id and embedding from response
        cleaned_jobs = []
        for job in jobs:
            cleaned_job = job.copy()
            cleaned_job.pop('user_id', None)
            cleaned_job.pop('embedding', None)
            cleaned_jobs.append(cleaned_job)
        
        return jsonify({
            'jobs': cleaned_jobs,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        print(f"Get all job descriptions error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job_description():
    """Get a specific job description"""
    try:
        job_id = request.view_args['job_id']
        job = JobDescription.find_by_id(job_id)
        
        if not job:
            return jsonify({'error': 'Job description not found'}), 404
        
        # Remove embedding from response (too large)
        job_data = job.copy()
        job_data.pop('embedding', None)
        
        return jsonify({'job': job_data}), 200
        
    except Exception as e:
        print(f"Get job description error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job_description():
    """Update a job description"""
    try:
        user_id = get_jwt_identity()
        job_id = request.view_args['job_id']
        
        # Check if job exists and belongs to user
        job = JobDescription.find_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job description not found'}), 404
        
        if job['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized to modify this job description'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # For simplicity, we'll recreate the embedding if any text field changes
        # In a production system, you might want to be more selective
        title = data.get('title', job['title']).strip()
        company = data.get('company', job['company']).strip()
        description = data.get('description', job['description']).strip()
        requirements = data.get('requirements', job['requirements'] or '').strip()
        
        # Validate required fields
        if not title or not company or not description:
            return jsonify({'error': 'Title, company, and description are required'}), 400
        
        # Generate new embedding if content changed
        new_embedding = None
        full_text = f"{title} {company} {description}"
        if requirements:
            full_text += f" {requirements}"
        
        old_full_text = f"{job['title']} {job['company']} {job['description']}"
        if job['requirements']:
            old_full_text += f" {job['requirements']}"
        
        if full_text != old_full_text:
            new_embedding = embedding_service.generate_embedding(full_text)
            JobDescription.update_embedding(job_id, new_embedding)
        
        # Note: This is a simplified update. In a full implementation,
        # you'd have an update method in the JobDescription model
        return jsonify({
            'message': 'Job description update functionality not fully implemented',
            'note': 'Embedding updated if content changed'
        }), 200
        
    except Exception as e:
        print(f"Update job description error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job_description():
    """Delete a job description"""
    try:
        user_id = get_jwt_identity()
        job_id = request.view_args['job_id']
        
        success = JobDescription.delete(job_id, user_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete job description or unauthorized'}), 404
        
        return jsonify({'message': 'Job description deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete job description error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_job_description():
    """Analyze a job description without saving it"""
    try:
        data = request.get_json()
        if not data or not data.get('description'):
            return jsonify({'error': 'Job description text is required'}), 400
        
        description = data['description'].strip()
        title = data.get('title', '').strip()
        company = data.get('company', '').strip()
        
        # Create full text for analysis
        full_text = description
        if title:
            full_text = f"{title} {full_text}"
        if company:
            full_text = f"{company} {full_text}"
        
        # Generate embedding
        embedding = embedding_service.generate_embedding(full_text)
        
        # Extract skills and requirements
        skills = document_processor.extract_skills(description)
        
        # Analyze text sections
        sections = document_processor.extract_resume_sections(description)
        
        return jsonify({
            'analysis': {
                'word_count': len(description.split()),
                'character_count': len(description),
                'skills_found': skills,
                'skills_count': len(skills),
                'has_embedding': embedding is not None,
                'sections': sections,
                'text_preview': description[:200] + '...' if len(description) > 200 else description
            }
        }), 200
        
    except Exception as e:
        print(f"Analyze job description error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@job_bp.route('/<int:job_id>/reprocess', methods=['POST'])
@jwt_required()
def reprocess_job_description():
    """Reprocess a job description to update embedding"""
    try:
        user_id = get_jwt_identity()
        job_id = request.view_args['job_id']
        
        job = JobDescription.find_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job description not found'}), 404
        
        if job['user_id'] != user_id:
            return jsonify({'error': 'Unauthorized to modify this job description'}), 403
        
        # Generate new embedding
        full_text = f"{job['title']} {job['company']} {job['description']}"
        if job['requirements']:
            full_text += f" {job['requirements']}"
        
        embedding = embedding_service.generate_embedding(full_text)
        
        # Update job embedding
        success = JobDescription.update_embedding(job_id, embedding)
        
        if not success:
            return jsonify({'error': 'Failed to update job description embedding'}), 500
        
        return jsonify({
            'message': 'Job description reprocessed successfully',
            'embedding_updated': embedding is not None
        }), 200
        
    except Exception as e:
        print(f"Reprocess job description error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

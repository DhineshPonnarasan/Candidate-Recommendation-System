from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
import uuid
from werkzeug.utils import secure_filename
from models.candidate_model import Candidate
from services.document_service import document_processor
from services.embedding_service import embedding_service
from config.app_config import AppConfig

candidate_bp = Blueprint('candidates', __name__)

def save_uploaded_file(file, folder='resumes'):
    """Save uploaded file and return file path"""
    try:
        if not file or file.filename == '':
            return None, 'No file selected'

        if request.content_length and request.content_length > AppConfig.MAX_CONTENT_LENGTH:
            return None, f'File exceeds max size limit of {AppConfig.MAX_CONTENT_LENGTH} bytes'
        
        if not AppConfig.allowed_file(file.filename):
            return None, 'File type not allowed'
        
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_name = uuid.uuid4().hex
        filename = f"{name[:64]}_{unique_name}{ext.lower()}"
        
        # Create upload directory if it doesn't exist
        upload_path = os.path.join(AppConfig.UPLOAD_FOLDER, folder)
        os.makedirs(upload_path, exist_ok=True)
        upload_path_abs = os.path.abspath(upload_path)
        
        file_path = os.path.abspath(os.path.join(upload_path, filename))
        if not file_path.startswith(upload_path_abs + os.sep):
            return None, 'Invalid upload path'

        file.save(file_path)

        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            return None, 'Uploaded file is empty'
        
        return file_path, None
    except Exception as e:
        return None, f'Error saving file: {str(e)}'


def _safe_remove_file(file_path):
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

@candidate_bp.route('/upload', methods=['POST'])
def upload_candidate_resume():
    """Upload and process a candidate resume"""
    try:
        # Check if file is present
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        
        # Save the uploaded file
        file_path, error = save_uploaded_file(file, 'resumes')
        if error:
            return jsonify({'error': error}), 400
        
        # Extract text from the resume
        file_extension = os.path.splitext(file.filename)[1].lower().lstrip('.')
        resume_text = document_processor.extract_text(file_path, file_extension)
        
        if not resume_text or len(resume_text.strip()) < 30:
            _safe_remove_file(file_path)
            return jsonify({'error': 'Could not extract text from resume'}), 400
        
        # Extract structured information (pass file_path for PDF hyperlink extraction)
        contact_info = document_processor.extract_contact_info(resume_text, file_path)
        skills = document_processor.extract_skills(resume_text)
        experience_years = document_processor.extract_experience_years(resume_text)
        resume_sections = document_processor.extract_resume_sections(resume_text)
        
        # Generate embedding
        embedding = embedding_service.generate_embedding(resume_text)
        
        # Prepare candidate data
        candidate_name = contact_info.get('name') or 'Unknown Candidate'
        candidate_email = contact_info.get('email') or request.form.get('email')
        candidate_phone = contact_info.get('phone') or request.form.get('phone')
        
        # Create candidate record
        candidate = Candidate.create(
            name=candidate_name,
            email=candidate_email,
            phone=candidate_phone,
            skills=skills,
            experience_years=experience_years,
            education=resume_sections.get('education', ''),
            location=contact_info.get('location'),
            resume_text=resume_text,
            file_path=file_path,
            embedding=embedding
        )
        
        if not candidate:
            _safe_remove_file(file_path)
            return jsonify({'error': 'Failed to create candidate record'}), 500
        
        # Return complete candidate data including all extracted fields
        return jsonify({
            'message': 'Resume uploaded and processed successfully',
            'candidate': {
                'id': candidate['id'],
                'name': candidate['name'],
                'email': candidate['email'],
                'phone': candidate['phone'],
                'linkedin': contact_info.get('linkedin'),
                'skills': candidate['skills'],
                'experience_years': candidate['experience_years'],
                'education': candidate['education'],
                'resume_text': resume_text,
                'extracted_info': {
                    'sections': resume_sections,
                    'skills_found': len(skills),
                    'has_embedding': embedding is not None,
                    'contact_info': contact_info
                }
            },
            # Also return at top level for easier access
            'resume_text': resume_text,
            'name': candidate_name,
            'email': candidate_email,
            'phone': candidate_phone,
            'linkedin': candidate_linkedin
        }), 201
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] Resume upload failed: {e}")
        print(f"[ERROR] Traceback:\n{error_trace}")
        return jsonify({
            'error': f'Failed to process resume: {str(e)}',
            'details': error_trace if AppConfig.DEBUG else None
        }), 500

@candidate_bp.route('/bulk-upload', methods=['POST'])
@jwt_required()
def bulk_upload_candidates():
    """Upload multiple candidate resumes"""
    try:
        files = request.files.getlist('resumes')
        
        if not files or len(files) == 0:
            return jsonify({'error': 'No files provided'}), 400
        
        results = []
        successful_uploads = 0
        failed_uploads = []
        
        for file in files:
            try:
                # Save the file
                file_path, error = save_uploaded_file(file, 'resumes')
                if error:
                    failed_uploads.append({'filename': file.filename, 'error': error})
                    continue
                
                # Process the resume
                file_extension = os.path.splitext(file.filename)[1].lower().lstrip('.')
                resume_text = document_processor.extract_text(file_path, file_extension)
                
                if not resume_text or len(resume_text.strip()) < 30:
                    _safe_remove_file(file_path)
                    failed_uploads.append({'filename': file.filename, 'error': 'Could not extract text'})
                    continue
                
                # Extract information (pass file_path for PDF hyperlink extraction)
                contact_info = document_processor.extract_contact_info(resume_text, file_path)
                skills = document_processor.extract_skills(resume_text)
                experience_years = document_processor.extract_experience_years(resume_text)
                resume_sections = document_processor.extract_resume_sections(resume_text)
                
                # Generate embedding
                embedding = embedding_service.generate_embedding(resume_text)
                
                # Create candidate
                candidate_name = contact_info.get('name') or 'Unknown Candidate'
                
                candidate = Candidate.create(
                    name=candidate_name,
                    email=contact_info.get('email'),
                    phone=contact_info.get('phone'),
                    skills=skills,
                    experience_years=experience_years,
                    education=resume_sections.get('education', ''),
                    location=contact_info.get('location'),
                    resume_text=resume_text,
                    file_path=file_path,
                    embedding=embedding
                )
                
                if candidate:
                    successful_uploads += 1
                    results.append({
                        'filename': file.filename,
                        'candidate_id': candidate['id'],
                        'candidate_name': candidate['name'],
                        'skills_found': len(skills)
                    })
                else:
                    _safe_remove_file(file_path)
                    failed_uploads.append({'filename': file.filename, 'error': 'Failed to create candidate record'})
                    
            except Exception as e:
                _safe_remove_file(file_path if 'file_path' in locals() else None)
                failed_uploads.append({'filename': file.filename, 'error': str(e)})
        
        return jsonify({
            'message': f'Bulk upload completed. {successful_uploads} successful, {len(failed_uploads)} failed.',
            'successful_uploads': successful_uploads,
            'failed_uploads': len(failed_uploads),
            'results': results,
            'failures': failed_uploads
        }), 200
        
    except Exception as e:
        print(f"Bulk upload error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@candidate_bp.route('', methods=['GET'])
@jwt_required()
def get_candidates():
    """Get list of candidates with pagination and search"""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 per page
        search = request.args.get('search', '').strip()
        
        offset = (page - 1) * limit
        
        if search:
            candidates = Candidate.search(search, limit)
        else:
            candidates = Candidate.get_all_active(limit, offset)
        
        return jsonify({
            'candidates': candidates,
            'page': page,
            'limit': limit,
            'search': search if search else None
        }), 200
        
    except Exception as e:
        print(f"Get candidates error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@candidate_bp.route('/<int:candidate_id>', methods=['GET'])
@jwt_required()
def get_candidate_details(candidate_id):
    """Get detailed information about a specific candidate"""
    try:
        candidate = Candidate.find_by_id(candidate_id)
        
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        # Remove embedding from response (too large)
        candidate_data = candidate.copy()
        candidate_data.pop('embedding', None)
        
        return jsonify({'candidate': candidate_data}), 200
        
    except Exception as e:
        print(f"Get candidate details error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@candidate_bp.route('/<int:candidate_id>', methods=['DELETE'])
@jwt_required()
def delete_candidate(candidate_id):
    """Delete a candidate"""
    try:
        success = Candidate.delete(candidate_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete candidate or candidate not found'}), 404
        
        return jsonify({'message': 'Candidate deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete candidate error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@candidate_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_candidate_statistics():
    """Get candidate database statistics"""
    try:
        stats = Candidate.get_statistics()
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        print(f"Get statistics error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@candidate_bp.route('/<int:candidate_id>/reprocess', methods=['POST'])
@jwt_required()
def reprocess_candidate(candidate_id):
    """Reprocess a candidate's resume to update extraction and embedding"""
    try:
        candidate = Candidate.find_by_id(candidate_id)
        
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        file_path = candidate.get('file_path')
        if not file_path or not os.path.exists(file_path):
            return jsonify({'error': 'Resume file not found'}), 404
        
        # Re-extract text
        file_extension = os.path.splitext(file_path)[1].lower().lstrip('.')
        resume_text = document_processor.extract_text(file_path, file_extension)
        
        if not resume_text:
            return jsonify({'error': 'Could not extract text from resume'}), 400
        
        # Re-generate embedding
        embedding = embedding_service.generate_embedding(resume_text)
        
        # Update candidate embedding
        success = Candidate.update_embedding(candidate_id, embedding)
        
        if not success:
            return jsonify({'error': 'Failed to update candidate embedding'}), 500
        
        return jsonify({
            'message': 'Candidate reprocessed successfully',
            'embedding_updated': embedding is not None
        }), 200
        
    except Exception as e:
        print(f"Reprocess candidate error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

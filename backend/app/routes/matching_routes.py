from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.matching_service import matching_service
from models.job_model import JobDescription
from models.candidate_model import Candidate

matching_bp = Blueprint('matching', __name__)

@matching_bp.route('/job/<int:job_id>/candidates', methods=['GET'])
@jwt_required()
def match_candidates_to_job():
    """Get candidates that match a specific job description"""
    try:
        job_id = request.view_args['job_id']
        
        # Get query parameters
        threshold = float(request.args.get('threshold', 0.3))
        limit = min(int(request.args.get('limit', 10)), 50)  # Max 50 candidates
        
        # Validate threshold
        if not 0.0 <= threshold <= 1.0:
            return jsonify({'error': 'Threshold must be between 0.0 and 1.0'}), 400
        
        # Check if job exists
        job = JobDescription.find_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job description not found'}), 404
        
        # Get matching candidates
        matches = matching_service.match_candidates_to_job(
            job_id=job_id,
            similarity_threshold=threshold,
            limit=limit
        )
        
        return jsonify({
            'job_id': job_id,
            'job_title': job['title'],
            'company': job['company'],
            'matches_found': len(matches),
            'threshold_used': threshold,
            'candidates': matches
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter values'}), 400
    except Exception as e:
        print(f"Match candidates to job error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@matching_bp.route('/candidate/<int:candidate_id>/jobs', methods=['GET'])
@jwt_required()
def match_jobs_to_candidate():
    """Get jobs that match a specific candidate"""
    try:
        candidate_id = request.view_args['candidate_id']
        
        # Get query parameters
        threshold = float(request.args.get('threshold', 0.3))
        limit = min(int(request.args.get('limit', 10)), 50)  # Max 50 jobs
        
        # Validate threshold
        if not 0.0 <= threshold <= 1.0:
            return jsonify({'error': 'Threshold must be between 0.0 and 1.0'}), 400
        
        # Check if candidate exists
        candidate = Candidate.find_by_id(candidate_id)
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        # Get matching jobs
        job_matches = matching_service.batch_match_jobs_to_candidate(
            candidate_id=candidate_id,
            similarity_threshold=threshold,
            limit=limit
        )
        
        return jsonify({
            'candidate_id': candidate_id,
            'candidate_name': candidate['name'],
            'matches_found': len(job_matches),
            'threshold_used': threshold,
            'jobs': job_matches
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter values'}), 400
    except Exception as e:
        print(f"Match jobs to candidate error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@matching_bp.route('/job/<int:job_id>/statistics', methods=['GET'])
@jwt_required()
def get_job_matching_statistics():
    """Get matching statistics for a specific job"""
    try:
        job_id = request.view_args['job_id']
        
        # Check if job exists
        job = JobDescription.find_by_id(job_id)
        if not job:
            return jsonify({'error': 'Job description not found'}), 404
        
        # Get matching statistics
        stats = matching_service.get_matching_statistics(job_id)
        
        if 'error' in stats:
            return jsonify({'error': stats['error']}), 500
        
        return jsonify({
            'job_id': job_id,
            'job_title': job['title'],
            'statistics': stats
        }), 200
        
    except Exception as e:
        print(f"Get job matching statistics error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@matching_bp.route('/quick-match', methods=['POST'])
@jwt_required(optional=True)  # Allow anonymous access during development
def quick_match():
    """Quick matching without saving job description"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        job_text = data.get('job_description', '').strip()
        if not job_text:
            return jsonify({'error': 'Job description is required'}), 400
        
        # Optional parameters
        threshold = float(data.get('threshold', 0.3))
        limit = min(int(data.get('limit', 10)), 50)
        
        # Validate threshold
        if not 0.0 <= threshold <= 1.0:
            return jsonify({'error': 'Threshold must be between 0.0 and 1.0'}), 400
        
        # Generate embedding for the job description
        from services.embedding_service import embedding_service
        job_embedding = embedding_service.generate_embedding(job_text)
        
        if job_embedding is None:
            return jsonify({'error': 'Failed to generate job description embedding'}), 500
        
        # Get all candidates with embeddings
        candidates = Candidate.get_candidates_with_embeddings()
        
        if not candidates:
            return jsonify({
                'message': 'No candidates with embeddings found',
                'matches_found': 0,
                'candidates': []
            }), 200
        
        # Find similar candidates
        matches = embedding_service.find_similar_candidates(
            job_embedding,
            candidates,
            threshold=threshold,
            top_k=limit
        )
        
        # Format results
        formatted_matches = []
        for i, match in enumerate(matches):
            formatted_match = {
                'candidate_id': match['id'],
                'candidate_name': match['name'],
                'candidate_email': match['email'],
                'similarity_score': round(match['similarity_score'], 3),
                'match_percentage': round(match['similarity_score'] * 100, 1),
                'ranking': i + 1,
                'skills': match.get('skills', []),
                'experience_years': match.get('experience_years'),
                'location': match.get('location')
            }
            formatted_matches.append(formatted_match)
        
        return jsonify({
            'message': 'Quick matching completed',
            'job_description_preview': job_text[:100] + '...' if len(job_text) > 100 else job_text,
            'matches_found': len(formatted_matches),
            'threshold_used': threshold,
            'candidates': formatted_matches
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter values'}), 400
    except Exception as e:
        print(f"Quick match error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@matching_bp.route('/batch-match', methods=['POST'])
@jwt_required()
def batch_match_multiple_jobs():
    """Batch match multiple jobs to candidates"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('job_ids'):
            return jsonify({'error': 'Job IDs are required'}), 400
        
        job_ids = data['job_ids']
        threshold = float(data.get('threshold', 0.3))
        limit_per_job = min(int(data.get('limit_per_job', 5)), 20)
        
        if not isinstance(job_ids, list) or len(job_ids) == 0:
            return jsonify({'error': 'Job IDs must be a non-empty list'}), 400
        
        if len(job_ids) > 10:  # Limit batch size
            return jsonify({'error': 'Maximum 10 jobs can be processed in a batch'}), 400
        
        batch_results = []
        
        for job_id in job_ids:
            try:
                # Check if job exists
                job = JobDescription.find_by_id(job_id)
                if not job:
                    batch_results.append({
                        'job_id': job_id,
                        'error': 'Job not found',
                        'matches': []
                    })
                    continue
                
                # Get matches for this job
                matches = matching_service.match_candidates_to_job(
                    job_id=job_id,
                    similarity_threshold=threshold,
                    limit=limit_per_job
                )
                
                batch_results.append({
                    'job_id': job_id,
                    'job_title': job['title'],
                    'company': job['company'],
                    'matches_found': len(matches),
                    'matches': matches
                })
                
            except Exception as e:
                batch_results.append({
                    'job_id': job_id,
                    'error': f'Error processing job: {str(e)}',
                    'matches': []
                })
        
        return jsonify({
            'message': 'Batch matching completed',
            'jobs_processed': len(job_ids),
            'threshold_used': threshold,
            'limit_per_job': limit_per_job,
            'results': batch_results
        }), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter values'}), 400
    except Exception as e:
        print(f"Batch match error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@matching_bp.route('/model-info', methods=['GET'])
@jwt_required()
def get_model_info():
    """Get information about the embedding model"""
    try:
        from services.embedding_service import embedding_service
        model_info = embedding_service.get_model_info()
        
        return jsonify({
            'model_info': model_info,
            'matching_service_status': 'active'
        }), 200
        
    except Exception as e:
        print(f"Get model info error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

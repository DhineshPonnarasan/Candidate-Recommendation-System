from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from config.sqlite_database import db_config

application_bp = Blueprint('applications', __name__)

class Application:
    """Application model for job application tracking"""
    
    @classmethod
    def create(cls, user_id, job_title, company, application_date, status='Applied', notes=None, follow_up_date=None):
        """Create a new application record"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO applications (user_id, job_title, company, application_date, status, notes, follow_up_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, job_title, company, application_date, status, notes, follow_up_date, created_at
            ''', (user_id, job_title, company, application_date, status, notes, follow_up_date))
            
            result = cursor.fetchone()
            conn.commit()
            return dict(result) if result else None
            
        except Exception as e:
            conn.rollback()
            print(f"Error creating application: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_user_id(cls, user_id, limit=50, offset=0):
        """Find applications by user ID"""
        conn = db_config.get_connection()
        if not conn:
            return []
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, job_title, company, application_date, status, notes, 
                       follow_up_date, interview_date, created_at, updated_at
                FROM applications 
                WHERE user_id = %s 
                ORDER BY application_date DESC, created_at DESC
                LIMIT %s OFFSET %s
            ''', (user_id, limit, offset))
            
            results = cursor.fetchall()
            return [dict(row) for row in results]
            
        except Exception as e:
            print(f"Error finding user applications: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def find_by_id(cls, application_id, user_id):
        """Find application by ID and user ID"""
        conn = db_config.get_connection()
        if not conn:
            return None
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, job_title, company, application_date, status, notes, 
                       follow_up_date, interview_date, created_at, updated_at
                FROM applications 
                WHERE id = %s AND user_id = %s
            ''', (application_id, user_id))
            
            result = cursor.fetchone()
            return dict(result) if result else None
            
        except Exception as e:
            print(f"Error finding application: {e}")
            return None
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def update(cls, application_id, user_id, **kwargs):
        """Update application record"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            
            # Build dynamic update query
            update_fields = []
            values = []
            
            allowed_fields = ['job_title', 'company', 'application_date', 'status', 'notes', 'follow_up_date', 'interview_date']
            
            for field in allowed_fields:
                if field in kwargs:
                    update_fields.append(f"{field} = %s")
                    values.append(kwargs[field])
            
            if not update_fields:
                return True
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            values.extend([application_id, user_id])
            
            query = f'''
                UPDATE applications 
                SET {', '.join(update_fields)}
                WHERE id = %s AND user_id = %s
            '''
            
            cursor.execute(query, values)
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error updating application: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def delete(cls, application_id, user_id):
        """Delete application record"""
        conn = db_config.get_connection()
        if not conn:
            return False
            
        try:
            cursor = conn.cursor()
            cursor.execute('''
                DELETE FROM applications 
                WHERE id = %s AND user_id = %s
            ''', (application_id, user_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            conn.rollback()
            print(f"Error deleting application: {e}")
            return False
        finally:
            cursor.close()
            conn.close()
    
    @classmethod
    def get_statistics(cls, user_id):
        """Get application statistics for a user"""
        conn = db_config.get_connection()
        if not conn:
            return {}
            
        try:
            cursor = conn.cursor()
            
            # Total applications
            cursor.execute('SELECT COUNT(*) FROM applications WHERE user_id = %s', (user_id,))
            total_applications = cursor.fetchone()[0]
            
            # Applications by status
            cursor.execute('''
                SELECT status, COUNT(*) 
                FROM applications 
                WHERE user_id = %s 
                GROUP BY status
            ''', (user_id,))
            status_counts = dict(cursor.fetchall())
            
            # Recent applications (last 30 days)
            cursor.execute('''
                SELECT COUNT(*) 
                FROM applications 
                WHERE user_id = %s AND application_date >= CURRENT_DATE - INTERVAL '30 days'
            ''', (user_id,))
            recent_applications = cursor.fetchone()[0]
            
            # Upcoming follow-ups
            cursor.execute('''
                SELECT COUNT(*) 
                FROM applications 
                WHERE user_id = %s AND follow_up_date >= CURRENT_DATE
            ''', (user_id,))
            upcoming_followups = cursor.fetchone()[0]
            
            return {
                'total_applications': total_applications,
                'status_breakdown': status_counts,
                'recent_applications': recent_applications,
                'upcoming_followups': upcoming_followups
            }
            
        except Exception as e:
            print(f"Error getting application statistics: {e}")
            return {}
        finally:
            cursor.close()
            conn.close()

@application_bp.route('', methods=['POST'])
@jwt_required()
def create_application():
    """Create a new job application record"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        job_title = data.get('job_title', '').strip()
        company = data.get('company', '').strip()
        application_date_str = data.get('application_date', '').strip()
        
        if not job_title:
            return jsonify({'error': 'Job title is required'}), 400
        
        if not company:
            return jsonify({'error': 'Company name is required'}), 400
        
        # Parse application date
        if application_date_str:
            try:
                application_date = datetime.strptime(application_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        else:
            application_date = date.today()
        
        # Optional fields
        status = data.get('status', 'Applied')
        notes = data.get('notes', '').strip() if data.get('notes') else None
        follow_up_date_str = data.get('follow_up_date', '').strip()
        
        follow_up_date = None
        if follow_up_date_str:
            try:
                follow_up_date = datetime.strptime(follow_up_date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid follow-up date format. Use YYYY-MM-DD'}), 400
        
        # Create application
        application = Application.create(
            user_id=user_id,
            job_title=job_title,
            company=company,
            application_date=application_date,
            status=status,
            notes=notes,
            follow_up_date=follow_up_date
        )
        
        if not application:
            return jsonify({'error': 'Failed to create application record'}), 500
        
        return jsonify({
            'message': 'Application record created successfully',
            'application': {
                'id': application['id'],
                'job_title': application['job_title'],
                'company': application['company'],
                'application_date': application['application_date'].isoformat() if application['application_date'] else None,
                'status': application['status'],
                'notes': application['notes'],
                'follow_up_date': application['follow_up_date'].isoformat() if application['follow_up_date'] else None,
                'created_at': application['created_at'].isoformat() if application['created_at'] else None
            }
        }), 201
        
    except Exception as e:
        print(f"Create application error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@application_bp.route('', methods=['GET'])
@jwt_required()
def get_applications():
    """Get user's job applications"""
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)  # Max 100 per page
        status_filter = request.args.get('status', '').strip()
        
        offset = (page - 1) * limit
        
        applications = Application.find_by_user_id(user_id, limit, offset)
        
        # Filter by status if provided
        if status_filter:
            applications = [app for app in applications if app['status'].lower() == status_filter.lower()]
        
        # Format dates for JSON response
        for app in applications:
            if app['application_date']:
                app['application_date'] = app['application_date'].isoformat()
            if app['follow_up_date']:
                app['follow_up_date'] = app['follow_up_date'].isoformat()
            if app['interview_date']:
                app['interview_date'] = app['interview_date'].isoformat()
            if app['created_at']:
                app['created_at'] = app['created_at'].isoformat()
            if app['updated_at']:
                app['updated_at'] = app['updated_at'].isoformat()
        
        return jsonify({
            'applications': applications,
            'page': page,
            'limit': limit,
            'status_filter': status_filter if status_filter else None
        }), 200
        
    except Exception as e:
        print(f"Get applications error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@application_bp.route('/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application():
    """Get a specific application"""
    try:
        user_id = get_jwt_identity()
        application_id = request.view_args['application_id']
        
        application = Application.find_by_id(application_id, user_id)
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Format dates
        if application['application_date']:
            application['application_date'] = application['application_date'].isoformat()
        if application['follow_up_date']:
            application['follow_up_date'] = application['follow_up_date'].isoformat()
        if application['interview_date']:
            application['interview_date'] = application['interview_date'].isoformat()
        if application['created_at']:
            application['created_at'] = application['created_at'].isoformat()
        if application['updated_at']:
            application['updated_at'] = application['updated_at'].isoformat()
        
        return jsonify({'application': application}), 200
        
    except Exception as e:
        print(f"Get application error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@application_bp.route('/<int:application_id>', methods=['PUT'])
@jwt_required()
def update_application():
    """Update an application"""
    try:
        user_id = get_jwt_identity()
        application_id = request.view_args['application_id']
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if application exists
        existing_app = Application.find_by_id(application_id, user_id)
        if not existing_app:
            return jsonify({'error': 'Application not found'}), 404
        
        # Prepare update data
        update_data = {}
        
        if 'job_title' in data:
            update_data['job_title'] = data['job_title'].strip()
        
        if 'company' in data:
            update_data['company'] = data['company'].strip()
        
        if 'status' in data:
            update_data['status'] = data['status'].strip()
        
        if 'notes' in data:
            update_data['notes'] = data['notes'].strip() if data['notes'] else None
        
        if 'application_date' in data:
            try:
                update_data['application_date'] = datetime.strptime(data['application_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid application date format. Use YYYY-MM-DD'}), 400
        
        if 'follow_up_date' in data:
            if data['follow_up_date']:
                try:
                    update_data['follow_up_date'] = datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'error': 'Invalid follow-up date format. Use YYYY-MM-DD'}), 400
            else:
                update_data['follow_up_date'] = None
        
        if 'interview_date' in data:
            if data['interview_date']:
                try:
                    update_data['interview_date'] = datetime.strptime(data['interview_date'], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        update_data['interview_date'] = datetime.strptime(data['interview_date'], '%Y-%m-%d')
                    except ValueError:
                        return jsonify({'error': 'Invalid interview date format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM:SS'}), 400
            else:
                update_data['interview_date'] = None
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update application
        success = Application.update(application_id, user_id, **update_data)
        
        if not success:
            return jsonify({'error': 'Failed to update application'}), 500
        
        # Get updated application
        updated_app = Application.find_by_id(application_id, user_id)
        
        # Format dates
        if updated_app['application_date']:
            updated_app['application_date'] = updated_app['application_date'].isoformat()
        if updated_app['follow_up_date']:
            updated_app['follow_up_date'] = updated_app['follow_up_date'].isoformat()
        if updated_app['interview_date']:
            updated_app['interview_date'] = updated_app['interview_date'].isoformat()
        if updated_app['created_at']:
            updated_app['created_at'] = updated_app['created_at'].isoformat()
        if updated_app['updated_at']:
            updated_app['updated_at'] = updated_app['updated_at'].isoformat()
        
        return jsonify({
            'message': 'Application updated successfully',
            'application': updated_app
        }), 200
        
    except Exception as e:
        print(f"Update application error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@application_bp.route('/<int:application_id>', methods=['DELETE'])
@jwt_required()
def delete_application():
    """Delete an application"""
    try:
        user_id = get_jwt_identity()
        application_id = request.view_args['application_id']
        
        success = Application.delete(application_id, user_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete application or application not found'}), 404
        
        return jsonify({'message': 'Application deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete application error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@application_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_application_statistics():
    """Get application statistics for the current user"""
    try:
        user_id = get_jwt_identity()
        stats = Application.get_statistics(user_id)
        
        return jsonify({'statistics': stats}), 200
        
    except Exception as e:
        print(f"Get application statistics error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

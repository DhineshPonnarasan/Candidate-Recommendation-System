from typing import List, Dict, Optional
import random
from services.embedding_service import embedding_service
from models.candidate_model import Candidate
from models.job_model import JobDescription
from config.redis_config import redis_config

class MatchingService:
    """Service for matching candidates to job descriptions"""
    
    def __init__(self):
        self.similarity_threshold = 0.3
        self.top_candidates_limit = 10
    
    def match_candidates_to_job(self, job_id: int, 
                               similarity_threshold: float = None,
                               limit: int = None) -> List[Dict]:
        """Match candidates to a specific job description"""
        try:
            # Set defaults
            threshold = similarity_threshold or self.similarity_threshold
            limit = limit or self.top_candidates_limit
            
            # Check cache first
            cache_key = f"matches:{job_id}:{threshold}:{limit}"
            cached_matches = redis_config.get_cached_candidate_matches(job_id)
            if cached_matches:
                return cached_matches[:limit]
            
            # Get job description with embedding
            job = JobDescription.find_by_id(job_id)
            if not job or not job.get('embedding'):
                print(f"Job {job_id} not found or missing embedding")
                return []
            
            # Get all candidates with embeddings
            candidates = Candidate.get_candidates_with_embeddings()
            if not candidates:
                print("No candidates with embeddings found")
                return []
            
            # Find similar candidates
            matches = embedding_service.find_similar_candidates(
                job['embedding'], 
                candidates,
                threshold=threshold,
                top_k=limit
            )
            
            # Enhance matches with additional information and summaries
            enhanced_matches = []
            for i, match in enumerate(matches):
                enhanced_match = self._create_match_summary(job, match, i + 1)
                enhanced_matches.append(enhanced_match)
            
            # Cache the results
            redis_config.cache_candidate_matches(job_id, enhanced_matches)
            
            return enhanced_matches
            
        except Exception as e:
            print(f"Error matching candidates to job: {e}")
            return []
    
    def _create_match_summary(self, job: Dict, candidate: Dict, ranking: int) -> Dict:
        """Create a detailed match summary for a candidate"""
        try:
            similarity_score = candidate.get('similarity_score', 0.0)
            
            summary = self._generate_match_summary(job, candidate, similarity_score)
            
            # Create the match result
            match_result = {
                'candidate_id': candidate.get('id'),
                'candidate_name': candidate.get('name', 'Unknown'),
                'candidate_email': candidate.get('email'),
                'candidate_phone': candidate.get('phone'),
                'similarity_score': round(similarity_score, 3),
                'ranking': ranking,
                'match_summary': summary,
                'candidate_skills': candidate.get('skills', []),
                'experience_years': candidate.get('experience_years'),
                'education': candidate.get('education'),
                'location': candidate.get('location'),
                'match_percentage': round(similarity_score * 100, 1)
            }
            
            return match_result
            
        except Exception as e:
            print(f"Error creating match summary: {e}")
            return {
                'candidate_id': candidate.get('id'),
                'candidate_name': candidate.get('name', 'Unknown'),
                'similarity_score': candidate.get('similarity_score', 0.0),
                'ranking': ranking,
                'match_summary': 'Error generating summary',
                'match_percentage': round(candidate.get('similarity_score', 0.0) * 100, 1)
            }
    
    def _generate_match_summary(self, job: Dict, candidate: Dict, similarity_score: float) -> str:
        """Generate an intelligent match summary"""
        try:
            job_title = job.get('title', 'this position')
            candidate_name = candidate.get('name', 'This candidate')
            candidate_skills = candidate.get('skills', [])
            experience_years = candidate.get('experience_years')
            education = candidate.get('education', '')
            
            job_description = job.get('description', '').lower()
            job_requirements = job.get('requirements', '').lower()
            job_text = f"{job_description} {job_requirements}"
            
            match_factors = []
            
            if candidate_skills:
                relevant_skills = self._find_relevant_skills(job_text, candidate_skills)
                if relevant_skills:
                    skills_str = ', '.join(relevant_skills[:3])
                    match_factors.append(f"strong technical skills in {skills_str}")
            
            if experience_years:
                if experience_years >= 5:
                    match_factors.append(f"{experience_years} years of professional experience")
                elif experience_years >= 2:
                    match_factors.append(f"{experience_years} years of relevant experience")
                else:
                    match_factors.append("emerging professional with practical experience")
            
            if education and any(keyword in education.lower() for keyword in ['degree', 'bachelor', 'master', 'phd', 'university', 'college']):
                if 'master' in education.lower() or 'phd' in education.lower():
                    match_factors.append("advanced educational background")
                else:
                    match_factors.append("solid educational foundation")
            
            if similarity_score >= 0.8:
                strength = "excellent"
                confidence = "highly recommended"
            elif similarity_score >= 0.6:
                strength = "strong"
                confidence = "well-suited"
            elif similarity_score >= 0.4:
                strength = "good"
                confidence = "potentially suitable"
            else:
                strength = "moderate"
                confidence = "may be considered"
            
            if match_factors:
                factors_text = ', '.join(match_factors)
                summary = f"{candidate_name} is {confidence} for {job_title} with a {strength} profile match. Key strengths include {factors_text}."
            else:
                summary = f"{candidate_name} shows {strength} alignment with {job_title} requirements and is {confidence} based on their professional background."
            
            if similarity_score >= 0.7:
                summary += " This candidate should be prioritized for immediate consideration."
            elif similarity_score >= 0.5:
                summary += " Recommend reviewing this candidate's full profile for potential fit."
            else:
                summary += " Consider as backup option or for future opportunities."
            
            return summary
            
        except Exception as e:
            print(f"Error generating match summary: {e}")
            return f"Candidate shows {round(similarity_score * 100)}% compatibility with the job requirements."
    
    def _find_relevant_skills(self, job_text: str, candidate_skills: List[str]) -> List[str]:
        """Find candidate skills that are relevant to the job"""
        relevant_skills = []
        
        for skill in candidate_skills:
            if skill.lower() in job_text:
                relevant_skills.append(skill)
        
        return relevant_skills
    
    def batch_match_jobs_to_candidate(self, candidate_id: int, 
                                    similarity_threshold: float = None,
                                    limit: int = None) -> List[Dict]:
        """Find matching jobs for a specific candidate"""
        try:
            threshold = similarity_threshold or self.similarity_threshold
            limit = limit or self.top_candidates_limit
            
            candidate = Candidate.find_by_id(candidate_id)
            if not candidate or not candidate.get('embedding'):
                print(f"Candidate {candidate_id} not found or missing embedding")
                return []
            
            jobs = JobDescription.get_all_active()
            jobs_with_embeddings = [job for job in jobs if job.get('embedding')]
            
            if not jobs_with_embeddings:
                print("No jobs with embeddings found")
                return []
            
            job_embeddings = [job['embedding'] for job in jobs_with_embeddings]
            similarities = embedding_service.calculate_batch_similarities(
                candidate['embedding'], 
                job_embeddings
            )
            
            job_matches = []
            for i, job in enumerate(jobs_with_embeddings):
                similarity_score = similarities[i]
                if similarity_score >= threshold:
                    job_match = {
                        'job_id': job['id'],
                        'job_title': job['title'],
                        'company': job['company'],
                        'similarity_score': round(similarity_score, 3),
                        'match_percentage': round(similarity_score * 100, 1),
                        'description': job['description'][:200] + '...' if len(job['description']) > 200 else job['description']
                    }
                    job_matches.append(job_match)
            
            job_matches.sort(key=lambda x: x['similarity_score'], reverse=True)
            return job_matches[:limit]
            
        except Exception as e:
            print(f"Error finding matching jobs for candidate: {e}")
            return []
    
    def get_matching_statistics(self, job_id: int) -> Dict:
        """Get statistics about candidate matching for a job"""
        try:
            all_candidates = Candidate.get_candidates_with_embeddings()
            total_candidates = len(all_candidates)
            
            if total_candidates == 0:
                return {
                    'total_candidates': 0,
                    'candidates_above_threshold': 0,
                    'average_similarity': 0.0,
                    'top_similarity': 0.0
                }
            
            job = JobDescription.find_by_id(job_id)
            if not job or not job.get('embedding'):
                return {'error': 'Job not found or missing embedding'}
            
            candidate_embeddings = [c['embedding'] for c in all_candidates]
            similarities = embedding_service.calculate_batch_similarities(
                job['embedding'], 
                candidate_embeddings
            )
            
            above_threshold = sum(1 for s in similarities if s >= self.similarity_threshold)
            avg_similarity = sum(similarities) / len(similarities) if similarities else 0.0
            top_similarity = max(similarities) if similarities else 0.0
            
            return {
                'total_candidates': total_candidates,
                'candidates_above_threshold': above_threshold,
                'average_similarity': round(avg_similarity, 3),
                'top_similarity': round(top_similarity, 3),
                'threshold_used': self.similarity_threshold
            }
            
        except Exception as e:
            print(f"Error getting matching statistics: {e}")
            return {'error': str(e)}

# Global matching service instance
matching_service = MatchingService()

import os
import re
from typing import List, Dict, Optional
from pdfminer.high_level import extract_text
from docx import Document
import tempfile

class DocumentProcessor:
    """Service for processing and extracting text from various document formats"""
    
    def __init__(self):
        self.supported_formats = ['pdf', 'doc', 'docx', 'txt']
    
    def extract_text(self, file_path: str, file_extension: str = None) -> str:
        """Extract text from document based on file extension"""
        try:
            if not file_extension:
                file_extension = os.path.splitext(file_path)[1].lower().lstrip('.')
            
            if file_extension == 'pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension in ['doc', 'docx']:
                return self._extract_from_docx(file_path)
            elif file_extension == 'txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            print(f"Error extracting text from {file_path}: {e}")
            return ""
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = extract_text(file_path)
            return self._clean_text(text)
        except Exception as e:
            print(f"Error extracting from PDF: {e}")
            return ""
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            full_text = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    full_text.append(paragraph.text)
            
            # Also extract text from tables
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            full_text.append(cell.text)
            
            text = '\n'.join(full_text)
            return self._clean_text(text)
            
        except Exception as e:
            print(f"Error extracting from DOCX: {e}")
            return ""
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
            return self._clean_text(text)
        except Exception as e:
            print(f"Error extracting from TXT: {e}")
            return ""
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep essential punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\@\#\$\%\&\*\+\=\_\|\\\/"\'`~]', '', text)
        
        # Remove very long sequences of repeated characters
        text = re.sub(r'(.)\1{5,}', r'\1\1', text)
        
        # Normalize line breaks
        text = re.sub(r'\n+', '\n', text)
        
        return text.strip()
    
    def extract_resume_sections(self, text: str) -> Dict[str, str]:
        """Extract structured information from resume text"""
        sections = {
            'personal_info': '',
            'summary': '',
            'experience': '',
            'education': '',
            'skills': '',
            'projects': '',
            'certifications': '',
            'other': ''
        }
        
        # Convert to lowercase for section detection
        text_lower = text.lower()
        lines = text.split('\n')
        
        current_section = 'personal_info'
        section_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            line_lower = line.lower()
            
            # Detect section headers
            if any(keyword in line_lower for keyword in ['experience', 'work history', 'employment', 'professional experience']):
                if section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = 'experience'
                section_content = []
            elif any(keyword in line_lower for keyword in ['education', 'academic', 'degree', 'university', 'college']):
                if section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = 'education'
                section_content = []
            elif any(keyword in line_lower for keyword in ['skills', 'technical skills', 'competencies', 'expertise']):
                if section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = 'skills'
                section_content = []
            elif any(keyword in line_lower for keyword in ['projects', 'portfolio', 'achievements']):
                if section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = 'projects'
                section_content = []
            elif any(keyword in line_lower for keyword in ['certifications', 'certificates', 'credentials']):
                if section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = 'certifications'
                section_content = []
            elif any(keyword in line_lower for keyword in ['summary', 'objective', 'profile', 'about']):
                if section_content:
                    sections[current_section] = '\n'.join(section_content)
                current_section = 'summary'
                section_content = []
            else:
                section_content.append(line)
        
        # Add the last section
        if section_content:
            sections[current_section] = '\n'.join(section_content)
        
        return sections
    
    def extract_contact_info(self, text: str) -> Dict[str, Optional[str]]:
        """Extract contact information from text"""
        contact_info = {
            'name': None,
            'email': None,
            'phone': None,
            'location': None
        }
        
        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact_info['email'] = email_match.group()
        
        # Extract phone number
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\+?([0-9]{1,3})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})',
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                contact_info['phone'] = phone_match.group()
                break
        
        # Extract name (first few words that look like a name)
        lines = text.split('\n')[:5]  # Check first 5 lines
        for line in lines:
            line = line.strip()
            if len(line.split()) >= 2 and len(line.split()) <= 4:
                if all(word.replace('-', '').replace("'", '').isalpha() for word in line.split()):
                    if not any(keyword in line.lower() for keyword in ['resume', 'cv', 'curriculum', 'contact', 'email', 'phone']):
                        contact_info['name'] = line
                        break
        
        return contact_info
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        # Common technical skills and keywords
        skill_keywords = [
            # Programming languages
            'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift',
            'typescript', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
            
            # Web technologies
            'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
            'spring', 'laravel', 'asp.net', 'bootstrap', 'jquery', 'webpack', 'sass', 'less',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server',
            'sqlite', 'cassandra', 'dynamodb', 'firebase',
            
            # Cloud and DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'gitlab', 'github',
            'terraform', 'ansible', 'puppet', 'chef', 'vagrant', 'travis ci', 'circle ci',
            
            # Data Science and AI
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
            'pandas', 'numpy', 'jupyter', 'tableau', 'power bi', 'spark', 'hadoop',
            'nltk', 'spacy', 'opencv', 'keras', 'xgboost',
            
            # General skills
            'agile', 'scrum', 'kanban', 'jira', 'confluence', 'slack', 'teams', 'zoom',
            'project management', 'leadership', 'communication', 'problem solving'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skill_keywords:
            if skill in text_lower:
                # Check if it's a whole word match
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.append(skill.title())
        
        # Remove duplicates and return
        return list(set(found_skills))
    
    def extract_experience_years(self, text: str) -> Optional[int]:
        """Extract years of experience from text"""
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?experience',
            r'experience\s*:?\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*in\s+\w+',
            r'over\s*(\d+)\s*years?',
            r'more\s*than\s*(\d+)\s*years?'
        ]
        
        text_lower = text.lower()
        
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    years = int(match.group(1))
                    if 0 <= years <= 50:  # Reasonable range
                        return years
                except (ValueError, IndexError):
                    continue
        
        return None

# Global document processor instance
document_processor = DocumentProcessor()

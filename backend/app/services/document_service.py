import os
import re
from typing import List, Dict, Optional
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams, LTTextContainer
from pdfminer.high_level import extract_pages
from docx import Document
import tempfile
from io import StringIO

# Import multiple PDF parsing libraries with fallbacks
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    print("Warning: pdfplumber not available. Install with: pip install pdfplumber")

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    print("Warning: PyPDF2 not available. Install with: pip install PyPDF2")

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
        """
        Extract text from PDF file using production-grade multi-library approach.
        Cascading fallback strategy: pdfplumber → pdfminer.six → PyPDF2 → basic
        
        This ensures maximum compatibility with different PDF formats and structures.
        """
        extracted_text = ""
        
        # Strategy 1: pdfplumber (best for modern PDFs with tables/layouts)
        if PDFPLUMBER_AVAILABLE:
            try:
                print(f"[PDF Parsing] Attempting pdfplumber extraction for {os.path.basename(file_path)}")
                with pdfplumber.open(file_path) as pdf:
                    pages_text = []
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            pages_text.append(page_text)
                    extracted_text = '\n\n'.join(pages_text)
                    
                    # Validate extracted text quality
                    if extracted_text and len(extracted_text.strip()) > 100:
                        # Check for binary data contamination
                        if not extracted_text.strip().startswith('%PDF-'):
                            print(f"[PDF Parsing] pdfplumber succeeded: {len(extracted_text)} characters")
                            return self._clean_text(extracted_text)
                        else:
                            print(f"[PDF Parsing] pdfplumber returned binary data, trying next strategy")
                    else:
                        print(f"[PDF Parsing] pdfplumber extracted insufficient text ({len(extracted_text)} chars), trying next strategy")
            except Exception as e:
                print(f"[PDF Parsing] pdfplumber failed: {e}, trying next strategy")
        
        # Strategy 2: pdfminer.six with layout preservation (current implementation)
        try:
            print(f"[PDF Parsing] Attempting pdfminer.six layout extraction for {os.path.basename(file_path)}")
            text_with_layout = self._extract_pdf_with_layout(file_path)
            if text_with_layout and len(text_with_layout.strip()) > 100:
                # Validate no binary data
                if not text_with_layout.strip().startswith('%PDF-'):
                    print(f"[PDF Parsing] pdfminer.six layout succeeded: {len(text_with_layout)} characters")
                    return self._clean_text(text_with_layout)
        except Exception as e:
            print(f"[PDF Parsing] pdfminer.six layout failed: {e}, trying next strategy")
        
        # Strategy 3: pdfminer.six standard extraction
        try:
            print(f"[PDF Parsing] Attempting pdfminer.six standard extraction for {os.path.basename(file_path)}")
            text_standard = extract_text(file_path, laparams=LAParams(
                line_margin=0.5,
                word_margin=0.1,
                char_margin=2.0,
                boxes_flow=0.5,
                all_texts=False
            ))
            if text_standard and len(text_standard.strip()) > 50:
                if not text_standard.strip().startswith('%PDF-'):
                    print(f"[PDF Parsing] pdfminer.six standard succeeded: {len(text_standard)} characters")
                    return self._clean_text(text_standard)
        except Exception as e:
            print(f"[PDF Parsing] pdfminer.six standard failed: {e}, trying next strategy")
        
        # Strategy 4: PyPDF2 (lightweight fallback)
        if PYPDF2_AVAILABLE:
            try:
                print(f"[PDF Parsing] Attempting PyPDF2 extraction for {os.path.basename(file_path)}")
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    pages_text = []
                    for page_num, page in enumerate(pdf_reader.pages):
                        try:
                            page_text = page.extract_text()
                            if page_text:
                                pages_text.append(page_text)
                        except Exception as page_err:
                            print(f"[PDF Parsing] PyPDF2 failed on page {page_num + 1}: {page_err}")
                            continue
                    extracted_text = '\n\n'.join(pages_text)
                    
                    if extracted_text and len(extracted_text.strip()) > 50:
                        if not extracted_text.strip().startswith('%PDF-'):
                            print(f"[PDF Parsing] PyPDF2 succeeded: {len(extracted_text)} characters")
                            return self._clean_text(extracted_text)
            except Exception as e:
                print(f"[PDF Parsing] PyPDF2 failed: {e}, trying final strategy")
        
        # Strategy 5: pdfminer.six aggressive extraction (last resort)
        try:
            print(f"[PDF Parsing] Attempting pdfminer.six aggressive extraction for {os.path.basename(file_path)}")
            text_aggressive = extract_text(file_path, laparams=LAParams(
                line_margin=0.3,
                word_margin=0.05,
                char_margin=1.0,
                boxes_flow=0.3,
                all_texts=True
            ))
            if text_aggressive and len(text_aggressive.strip()) > 0:
                if not text_aggressive.strip().startswith('%PDF-'):
                    print(f"[PDF Parsing] pdfminer.six aggressive succeeded: {len(text_aggressive)} characters")
                    return self._clean_text(text_aggressive)
        except Exception as e:
            print(f"[PDF Parsing] pdfminer.six aggressive failed: {e}")
        
        # All strategies failed
        print(f"[PDF Parsing] All extraction strategies failed for {os.path.basename(file_path)}")
        return ""
    
    def _extract_pdf_with_layout(self, file_path: str) -> str:
        """
        Extract text preserving layout structure - similar to how production ATS systems work.
        This method maintains reading order and line breaks critical for resume parsing.
        """
        try:
            output = StringIO()
            pages_text = []
            
            # Extract pages with layout analysis
            for page_layout in extract_pages(file_path, laparams=LAParams(
                line_margin=0.5,
                word_margin=0.1,
                char_margin=2.0,
                boxes_flow=0.5,
                all_texts=False,
                detect_vertical=False  # Most resumes are horizontal
            )):
                page_text = []
                
                # Extract text elements in reading order
                def extract_element(element):
                    if isinstance(element, LTTextContainer):
                        # Get text with proper spacing
                        text = element.get_text()
                        # Clean up but preserve line structure
                        text = text.strip()
                        if text:
                            return text
                    return None
                
                # Process elements top-to-bottom, left-to-right
                elements = []
                for element in page_layout:
                    if isinstance(element, LTTextContainer):
                        # Get bounding box for ordering
                        x0, y0, x1, y1 = element.bbox
                        text = element.get_text().strip()
                        if text and len(text) > 0:
                            elements.append({
                                'text': text,
                                'y0': y0,  # Top coordinate (higher = top of page)
                                'x0': x0   # Left coordinate
                            })
                
                # Sort by reading order: top to bottom, then left to right
                # In PDF coordinates, y decreases downward, so we reverse
                elements.sort(key=lambda e: (-e['y0'], e['x0']))
                
                # Group elements into lines (similar Y coordinates)
                lines = []
                current_line = []
                current_y = None
                y_threshold = 10  # Pixels - elements within this are same line
                
                for elem in elements:
                    if current_y is None:
                        current_y = elem['y0']
                        current_line = [elem['text']]
                    elif abs(elem['y0'] - current_y) < y_threshold:
                        # Same line - append
                        current_line.append(elem['text'])
                    else:
                        # New line
                        if current_line:
                            lines.append(' '.join(current_line))
                        current_line = [elem['text']]
                        current_y = elem['y0']
                
                # Add last line
                if current_line:
                    lines.append(' '.join(current_line))
                
                page_text = '\n'.join(lines)
                if page_text.strip():
                    pages_text.append(page_text)
            
            result = '\n\n'.join(pages_text)  # Separate pages with double newline
            return result
            
        except Exception as e:
            print(f"Layout-based extraction failed: {e}")
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
        """
        Clean and normalize extracted text while preserving structure.
        Unlike basic cleaning, this preserves line breaks critical for resume parsing.
        """
        if not text:
            return ""
        
        # Normalize unicode whitespace characters
        text = text.replace('\u00A0', ' ')  # Non-breaking space
        text = text.replace('\u2000', ' ')  # En quad
        text = text.replace('\u2001', ' ')  # Em quad
        text = text.replace('\u2002', ' ')  # En space
        text = text.replace('\u2003', ' ')  # Em space
        text = text.replace('\u2009', ' ')  # Thin space
        text = text.replace('\u202F', ' ')  # Narrow no-break space
        text = text.replace('\uFEFF', '')   # Zero-width no-break space
        
        # Preserve line structure: normalize multiple spaces to single space within lines
        # But keep newlines to maintain document structure
        lines = text.split('\n')
        cleaned_lines = []
        for line in lines:
            # Clean spaces within line but preserve the line break
            cleaned_line = re.sub(r'[ \t]+', ' ', line.strip())
            if cleaned_line:  # Only add non-empty lines
                cleaned_lines.append(cleaned_line)
        
        # Rejoin with single newline (preserve structure)
        text = '\n'.join(cleaned_lines)
        
        # Remove very long sequences of repeated characters (corruption indicators)
        text = re.sub(r'(.)\1{10,}', r'\1\1', text)
        
        # Remove excessive consecutive newlines (max 2)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
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
        """Extract contact information from text - aligned with frontend logic"""
        contact_info = {
            'name': None,
            'email': None,
            'phone': None,
            'linkedin': None,
            'location': None
        }
        
        if not text or len(text.strip()) < 10:
            return contact_info
        
        # Extract email - robust pattern
        email_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
            r'[A-Za-z0-9._%+-]+\s*\[at\]\s*[A-Za-z0-9.-]+\s*\[dot\]\s*[A-Za-z]{2,}',
            r'[A-Za-z0-9._%+-]+\s+at\s+[A-Za-z0-9.-]+\s+dot\s+[A-Za-z]{2,}',
        ]
        
        for pattern in email_patterns:
            email_match = re.search(pattern, text, re.IGNORECASE)
            if email_match:
                email = email_match.group()
                email = re.sub(r'\s*\[at\]\s*', '@', email, flags=re.IGNORECASE)
                email = re.sub(r'\s+at\s+', '@', email, flags=re.IGNORECASE)
                email = re.sub(r'\s*\[dot\]\s*', '.', email, flags=re.IGNORECASE)
                email = re.sub(r'\s+dot\s+', '.', email, flags=re.IGNORECASE)
                if re.match(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', email):
                    contact_info['email'] = email
                    break
        
        # Extract phone - country-agnostic with validation
        phone_patterns = [
            r'\+?1?[\s.-]?\(?([2-9]\d{2})\)?[\s.-]?([2-9]\d{2})[\s.-]?(\d{4})\b',
            r'\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b',
            r'\b([2-9]\d{1,2}[\s.-]?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{0,4})\b',
        ]
        
        for pattern in phone_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                candidate = match.group(0)
                digits = re.sub(r'\D', '', candidate)
                
                # Validation
                if len(digits) < 10 or len(digits) > 15:
                    continue
                if re.match(r'^(19|20)\d{2}$', digits):  # Years
                    continue
                if re.match(r'^(\d)\1{6,}$', digits):  # Repeated
                    continue
                if re.match(r'^0+$', digits):  # All zeros
                    continue
                
                # Prefer early matches (contact section)
                if match.start() < 500 or not contact_info['phone']:
                    contact_info['phone'] = candidate
                    if match.start() < 500:
                        break
            if contact_info['phone']:
                break
        
        # Extract name using positional heuristics (top of document) - same logic as frontend
        banned = re.compile(r'\b(RESUME|CURRICULUM|VITAE|CONTACT|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|PHONE|EMAIL|ADDRESS|CITY|STATE|ZIP|COUNTRY|PAGE|DATE)\b', re.IGNORECASE)
        lines = text.split('\n')[:10]
        
        # Get first 3-5 non-empty lines
        non_empty_lines = []
        for line in lines:
            line = line.strip()
            if line and len(line) >= 3:
                non_empty_lines.append(line)
                if len(non_empty_lines) >= 5:
                    break
        
        for i, line in enumerate(non_empty_lines[:5]):
            # Skip headers, contact info, metadata
            if banned.search(line):
                continue
            if re.match(r'^[A-Z\s]{0,3}$', line):
                continue
            if '@' in line and not re.match(r'^[A-Z][a-z]+', line):
                continue
            if 'http' in line:
                continue
            if re.search(r'^\+?\d[\d\s().-]{7,}', line):
                continue
            if re.search(r'^\d+[\/\-]\d+[\/\-]\d+', line):
                continue
            
            # Pattern 1: Standard name format - FirstName LastName
            name_match = re.match(r'^([A-Z][a-z]{1,20}(?:\s+[A-Z][a-zA-Z\-\']{1,20}){1,3})\b', line)
            if name_match:
                candidate = name_match.group(1).strip()
                words = candidate.split()
                if 2 <= len(words) <= 4 and not banned.search(candidate):
                    # Validate all words start with capital
                    if all(re.match(r'^[A-Z][a-z]+', w) for w in words):
                        contact_info['name'] = candidate
                        break
            
            # Pattern 2: All-caps names
            caps_match = re.match(r'^([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\b', line)
            if caps_match and not banned.search(caps_match.group(1)):
                candidate = caps_match.group(1).title()
                words = candidate.split()
                if 2 <= len(words) <= 4:
                    contact_info['name'] = candidate
                    break
            
            # Pattern 3: Mixed case but valid structure
            mixed_match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s|$)', line)
            if mixed_match:
                candidate = mixed_match.group(1).strip()
                words = candidate.split()
                if 2 <= len(words) <= 4 and not banned.search(candidate):
                    if all(len(w) > 1 and w[0].isupper() for w in words):
                        contact_info['name'] = candidate
                        break
        
        # Fallback: extract from LinkedIn URL
        if not contact_info['name']:
            li_match = re.search(r'linkedin\.com/in/([A-Za-z0-9._-]{3,80})', text, re.IGNORECASE)
            if li_match:
                handle = li_match.group(1)
                name_from_li = re.sub(r'[_.-]+', ' ', handle)
                name_from_li = re.sub(r'\d+', '', name_from_li)
                words = [w for w in name_from_li.split() if len(w) > 1]
                if 2 <= len(words) <= 4:
                    contact_info['name'] = ' '.join(w.capitalize() for w in words)
        
        # Fallback: extract from email
        if not contact_info['name'] and contact_info['email']:
            local = contact_info['email'].split('@')[0]
            local = re.sub(r'[._-]+', ' ', local)
            local = re.sub(r'\d+', '', local)
            words = [w for w in local.split() if len(w) > 1]
            if 2 <= len(words) <= 4:
                contact_info['name'] = ' '.join(w.capitalize() for w in words)
        
        # Extract LinkedIn URL
        linkedin_patterns = [
            r'linkedin\.com/in/([A-Za-z0-9._-]{3,80})',
            r'linkedin\.com/pub/([A-Za-z0-9._-]{3,80})',
            r'www\.linkedin\.com/in/([A-Za-z0-9._-]{3,80})',
            r'https?://linkedin\.com/in/([A-Za-z0-9._-]{3,80})',
        ]
        
        for pattern in linkedin_patterns:
            li_match = re.search(pattern, text, re.IGNORECASE)
            if li_match:
                handle = li_match.group(1)
                # Normalize to full URL
                contact_info['linkedin'] = f"https://linkedin.com/in/{handle}"
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

import os
import re
from typing import List, Dict, Optional, Any
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams, LTTextContainer
from pdfminer.high_level import extract_pages
from docx import Document

try:
    import spacy
except ImportError:
    spacy = None

class DocumentProcessor:
    """Service for processing and extracting text from various document formats"""
    
    def __init__(self):
        self.supported_formats = ['pdf', 'docx', 'txt']
        self._nlp = None
        self._nlp_attempted = False

    def _get_spacy_nlp(self):
        """Load spaCy model lazily; degrade gracefully if unavailable."""
        if self._nlp_attempted:
            return self._nlp

        self._nlp_attempted = True
        if spacy is None:
            return None

        try:
            self._nlp = spacy.load('en_core_web_sm')
        except Exception as e:
            print(f"spaCy model load failed (en_core_web_sm): {e}")
            self._nlp = None

        return self._nlp

    def _normalize_input_for_details(self, text: str) -> str:
        if not text:
            return ""

        # Normalize whitespace and line endings first.
        text = text.replace('\x00', ' ').replace('\r\n', '\n').replace('\r', '\n')
        lines = [re.sub(r'\s+', ' ', line).strip() for line in text.split('\n')]

        # Remove common resume header/footer noise from OCR/PDF extraction.
        noise_patterns = [
            r'^page\s+\d+(\s+of\s+\d+)?$',
            r'^generated\s+on\s+.+$',
            r'^confidential$',
            r'^curriculum\s+vitae$',
            r'^resume$',
            r'^[\W_]+$',
        ]

        filtered = []
        for line in lines:
            if not line:
                continue
            if any(re.match(pattern, line, flags=re.IGNORECASE) for pattern in noise_patterns):
                continue
            filtered.append(line)

        return '\n'.join(filtered)

    def _normalize_name(self, name: Optional[str]) -> Optional[str]:
        if not name:
            return None

        name = re.sub(r'\.(pdf|doc|docx|txt)\b', '', name, flags=re.IGNORECASE)
        name = re.sub(r'[^A-Za-z\s]', ' ', name)
        name = re.sub(r'\s+', ' ', name).strip()
        if not name:
            return None

        name = ' '.join(part.capitalize() for part in name.split())
        return name

    def is_valid_name(self, name: Optional[str]) -> bool:
        if not name:
            return False

        lowered = name.lower().strip()
        if 'resume' in lowered or 'cv' in lowered or '.pdf' in lowered or '_' in lowered:
            return False

        if re.search(r'\d', name):
            return False

        if not re.fullmatch(r'[A-Za-z\s]+', name):
            return False

        tokens = [token for token in name.split() if token]
        if len(tokens) < 2 or len(tokens) > 5:
            return False

        banned_tokens = {
            'resume', 'curriculum', 'vitae', 'email', 'phone', 'contact',
            'contacts',
            'linkedin', 'github', 'portfolio', 'summary', 'objective',
            'experience', 'education', 'skills', 'projects', 'candidate'
        }
        if any(token.lower() in banned_tokens for token in tokens):
            return False

        return True

    def _extract_name_ner(self, text: str) -> Optional[str]:
        nlp = self._get_spacy_nlp()
        if not nlp:
            return None

        top_block = '\n'.join(text.split('\n')[:16])
        try:
            doc = nlp(top_block)
            for ent in doc.ents:
                if ent.label_ == 'PERSON':
                    candidate = self._normalize_name(ent.text)
                    if self.is_valid_name(candidate):
                        return candidate
        except Exception as e:
            print(f"spaCy PERSON extraction failed: {e}")

        return None

    def _extract_name_from_top_lines(self, text: str) -> Optional[str]:
        # Rule-based name extraction from first 5 lines only.
        lines = [line.strip() for line in text.split('\n')[:5] if line.strip()]
        stop_markers = re.compile(
            r'email|phone|mobile|linkedin|github|portfolio|@|http|www\.|experience|education|skills|contact|contacts',
            flags=re.IGNORECASE,
        )

        for line in lines:
            if stop_markers.search(line):
                continue
            if re.search(r'\d', line):
                continue
            candidate = self._normalize_name(line)
            # Accept only 2 to 4 alphabetic words for primary rule-based extraction.
            if candidate and re.fullmatch(r'[A-Za-z]+(?:\s+[A-Za-z]+){1,3}', candidate) and self.is_valid_name(candidate):
                return candidate

        return None

    def _extract_email(self, text: str) -> Optional[str]:
        match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}', text)
        return match.group(0).strip() if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        pattern = r'(\+?\d{1,3}[-.\s]?)?\d{10}'
        matches = list(re.finditer(pattern, text))

        # Retry on compacted text to support formatted values like +1 (202) 555-0123.
        if not matches:
            compacted = re.sub(r'[()\s.-]+', '', text)
            matches = list(re.finditer(pattern, compacted))

        candidates = []

        for match in matches:
            raw = match.group(0)
            normalized = re.sub(r'[^\d+]', '', raw)
            digits = re.sub(r'\D', '', normalized)
            if 10 <= len(digits) <= 13:
                candidates.append((len(digits), normalized))

        if not candidates:
            return None

        candidates.sort(key=lambda item: item[0], reverse=True)
        return candidates[0][1]

    def _normalize_linkedin(self, value: str) -> str:
        value = value.strip().rstrip(').,;')
        if not re.match(r'^https?://', value, flags=re.IGNORECASE):
            value = f'https://{value}'
        value = value.replace('http://', 'https://')
        value = value.replace('linkedin.com/', 'www.linkedin.com/')
        return value

    def _extract_linkedin(self, text: str) -> Optional[str]:
        patterns = [
            r'https?://(?:www\.)?linkedin\.com/in/[A-Za-z0-9._%-]+',
            r'(?:www\.)?linkedin\.com/in/[A-Za-z0-9._%-]+',
        ]

        squashed = re.sub(r'\s+', '', text)
        for source in (text, squashed):
            for pattern in patterns:
                match = re.search(pattern, source, flags=re.IGNORECASE)
                if match:
                    return self._normalize_linkedin(match.group(0))
        return None

    def _field_confidence(self, value: Optional[str], source: str) -> float:
        if not value:
            return 0.0
        if source == 'ner':
            return 0.95
        if source == 'top_lines':
            return 0.85
        if source == 'regex':
            return 0.9
        if source == 'fallback':
            return 0.65
        return 0.5

    def extract_candidate_details_with_confidence(self, text: str) -> Dict[str, Any]:
        """Extract candidate details using NER + regex + heuristics with confidence scores."""
        normalized_text = self._normalize_input_for_details(text)

        email = self._extract_email(normalized_text)
        phone = self._extract_phone(normalized_text)
        linkedin = self._extract_linkedin(normalized_text)

        name = None
        name_source = 'not_found'

        # Primary approach: rule-based extraction from first 5 lines.
        top_line_name = self._extract_name_from_top_lines(normalized_text)
        if top_line_name:
            name = top_line_name
            name_source = 'top_lines'
        else:
            # Optional fallback: NER PERSON extraction.
            name_ner = self._extract_name_ner(normalized_text)
            if name_ner:
                name = name_ner
                name_source = 'ner'

        if not self.is_valid_name(name):
            name = None
            name_source = 'not_found'

        details = {
            'name': name or 'Unknown Candidate',
            'email': email or 'Not Found',
            'phone': phone or 'Not Found',
            'linkedin': linkedin or 'Not Found',
            'confidence': {
                'name': self._field_confidence(name, name_source),
                'email': self._field_confidence(email, 'regex'),
                'phone': self._field_confidence(phone, 'regex'),
                'linkedin': self._field_confidence(linkedin, 'regex'),
            }
        }

        return details

    def extract_candidate_details(self, text: str) -> Dict[str, str]:
        """Required extraction API that returns normalized structured candidate fields."""
        details = self.extract_candidate_details_with_confidence(text)
        return {
            'name': details.get('name', 'Unknown Candidate'),
            'email': details.get('email', 'Not Found'),
            'phone': details.get('phone', 'Not Found'),
            'linkedin': details.get('linkedin', 'Not Found'),
        }
    
    def extract_text(self, file_path: str, file_extension: str = None) -> str:
        """Extract text from document based on file extension"""
        try:
            if not file_extension:
                file_extension = os.path.splitext(file_path)[1].lower().lstrip('.')
            
            if file_extension == 'pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension == 'docx':
                return self._extract_from_docx(file_path)
            elif file_extension == 'doc':
                return self._extract_from_doc(file_path)
            elif file_extension == 'txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            print(f"Error extracting text from {file_path}: {e}")
            return ""

    def _extract_from_doc(self, file_path: str) -> str:
        """Legacy .doc extraction is intentionally unsupported for reliability."""
        print(f"Unsupported format for parser: {file_path}")
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
    
    def extract_pdf_hyperlinks(self, file_path: str) -> List[str]:
        """
        Extract all hyperlink URLs from a PDF file using PyMuPDF.
        
        This is critical for resumes where LinkedIn URLs exist only as clickable
        hyperlinks (annotations) without visible URL text.
        
        Returns:
            List of all URLs found in PDF hyperlink annotations
        """
        urls = []
        
        if not PYMUPDF_AVAILABLE:
            print("[PDF Hyperlinks] PyMuPDF not available, skipping hyperlink extraction")
            return urls
        
        if not file_path or not os.path.exists(file_path):
            return urls
        
        # Check if it's a PDF file
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext != '.pdf':
            return urls
        
        try:
            print(f"[PDF Hyperlinks] Extracting hyperlinks from {os.path.basename(file_path)}")
            doc = fitz.open(file_path)
            
            for page_num, page in enumerate(doc):
                # Get all links on the page
                links = page.get_links()
                for link in links:
                    # Extract URI from link annotation
                    uri = link.get('uri')
                    if uri and isinstance(uri, str) and uri.strip():
                        # Clean the URL
                        uri = uri.strip()
                        # Skip javascript: and mailto: links
                        if not uri.startswith(('javascript:', 'mailto:')):
                            urls.append(uri)
                            print(f"[PDF Hyperlinks] Found URL on page {page_num + 1}: {uri[:80]}...")
            
            doc.close()
            print(f"[PDF Hyperlinks] Extracted {len(urls)} hyperlinks total")
            
        except Exception as e:
            print(f"[PDF Hyperlinks] Error extracting hyperlinks: {e}")
        
        return urls
    
    def extract_linkedin_from_hyperlinks(self, hyperlinks: List[str]) -> Optional[str]:
        """
        Find and normalize LinkedIn URL from a list of hyperlinks.
        
        Args:
            hyperlinks: List of URLs extracted from PDF
            
        Returns:
            Normalized LinkedIn URL or None if not found
        """
        if not hyperlinks:
            return None
        
        linkedin_urls = []
        
        for url in hyperlinks:
            if not url or not isinstance(url, str):
                continue
            
            url_lower = url.lower()
            
            # Check if it's a LinkedIn URL
            if 'linkedin.com' not in url_lower:
                continue
            
            # Prioritize profile URLs
            # Priority 1: linkedin.com/in/ (personal profile)
            if '/in/' in url_lower:
                linkedin_urls.insert(0, url)  # Highest priority
            # Priority 2: linkedin.com/pub/ (public profile)
            elif '/pub/' in url_lower:
                linkedin_urls.append(url)
            # Priority 3: linkedin.com/profile/ (legacy format)
            elif '/profile/' in url_lower:
                linkedin_urls.append(url)
            # Priority 4: Any other linkedin.com URL
            else:
                linkedin_urls.append(url)
        
        if not linkedin_urls:
            return None
        
        # Take the first (highest priority) LinkedIn URL
        best_url = linkedin_urls[0]
        
        # Normalize the URL
        return self._normalize_linkedin_url(best_url)
    
    def _normalize_linkedin_url(self, url: str) -> Optional[str]:
        """
        Normalize a LinkedIn URL to standard format: https://linkedin.com/in/{username}
        
        Handles:
        - Protocol variations (http/https)
        - www prefix
        - Tracking parameters
        - URL fragments
        - Various path formats (/in/, /pub/, /profile/)
        """
        if not url:
            return None
        
        try:
            # Remove tracking parameters and fragments
            url = re.sub(r'\?.*$', '', url)
            url = re.sub(r'#.*$', '', url)
            
            # Extract username from various formats
            patterns = [
                # linkedin.com/in/username
                r'linkedin\.com/in/([A-Za-z0-9._%-]+)',
                # linkedin.com/pub/username
                r'linkedin\.com/pub/([A-Za-z0-9._%-]+)',
                # linkedin.com/profile/view?id=username (already stripped params, but handle path)
                r'linkedin\.com/profile/view/([A-Za-z0-9._%-]+)',
            ]
            
            for pattern in patterns:
                match = re.search(pattern, url, re.IGNORECASE)
                if match:
                    username = match.group(1)
                    # Clean trailing slashes or punctuation
                    username = re.sub(r'[/\\.,;:!?\s]+$', '', username)
                    
                    # Validate username using existing validation
                    if self._is_valid_linkedin_username(username):
                        return f"https://linkedin.com/in/{username}"
            
            # If we have a LinkedIn URL but couldn't extract username, return None
            # NEVER fabricate a username
            return None
            
        except Exception as e:
            print(f"[LinkedIn Normalize] Error normalizing URL {url}: {e}")
            return None
    
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
            for encoding in ('utf-8', 'latin-1', 'cp1252'):
                try:
                    with open(file_path, 'r', encoding=encoding) as file:
                        text = file.read()
                    return self._clean_text(text)
                except UnicodeDecodeError:
                    continue
            return ""
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

        normalized_lines = []
        for raw_line in text.replace('\r\n', '\n').replace('\r', '\n').split('\n'):
            line = raw_line.strip()
            if not line:
                continue

            # Keep line boundaries to improve section extraction quality.
            line = re.sub(r'\s+', ' ', line)
            line = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\[\]\@\#\$\%\&\*\+\=\_\|\\\/"\'`~]', '', line)
            line = re.sub(r'(.)\1{5,}', r'\1\1', line)

            if line:
                normalized_lines.append(line)

        return '\n'.join(normalized_lines).strip()
    
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
        """Backward-compatible contact extraction used across existing routes."""
        details = self.extract_candidate_details_with_confidence(text)
        return {
            'name': None if details['name'] in {'Not Found', 'Unknown Candidate'} else details['name'],
            'email': None if details['email'] == 'Not Found' else details['email'],
            'phone': None if details['phone'] == 'Not Found' else details['phone'],
            'linkedin': None if details['linkedin'] == 'Not Found' else details['linkedin'],
            'location': None,
            'confidence': details.get('confidence', {})
        }
    
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


def extract_candidate_details(text: str) -> dict:
    """Module-level extraction helper for direct usage in Flask routes/services."""
    return document_processor.extract_candidate_details(text)


def is_valid_name(name: str) -> bool:
    """Module-level name validation helper required by parsing pipeline."""
    return document_processor.is_valid_name(name)

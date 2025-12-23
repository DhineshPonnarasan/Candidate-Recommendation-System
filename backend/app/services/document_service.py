import os
import re
from typing import List, Dict, Optional  # PDF hyperlink extraction support added
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

try:
    import fitz  # PyMuPDF for hyperlink extraction
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    print("Warning: PyMuPDF not available. Install with: pip install PyMuPDF")

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
    
    def extract_contact_info(self, text: str, file_path: str = None) -> Dict[str, Optional[str]]:
        """
        Extract contact information from text - aligned with frontend logic.
        
        Args:
            text: Extracted text content from the document
            file_path: Optional path to the original file (for PDF hyperlink extraction)
        
        Returns:
            Dict with name, email, phone, linkedin, location
        """
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
        
        # Extract phone - IMPROVED with expanded format support
        contact_info['phone'] = self._extract_phone_number(text)
        
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
        
        # Extract LinkedIn URL with improved detection
        # Strategy 1: Try text-based extraction first
        contact_info['linkedin'] = self._extract_linkedin_url(text)
        
        # Strategy 2: FALLBACK - Extract from PDF hyperlinks if text extraction failed
        # This handles resumes where LinkedIn is only a clickable link without visible URL text
        if not contact_info['linkedin'] and file_path:
            try:
                hyperlinks = self.extract_pdf_hyperlinks(file_path)
                if hyperlinks:
                    linkedin_from_hyperlink = self.extract_linkedin_from_hyperlinks(hyperlinks)
                    if linkedin_from_hyperlink:
                        print(f"[Contact Info] LinkedIn found via PDF hyperlink: {linkedin_from_hyperlink}")
                        contact_info['linkedin'] = linkedin_from_hyperlink
            except Exception as e:
                print(f"[Contact Info] Error extracting LinkedIn from hyperlinks: {e}")
        
        return contact_info
    
    def _normalize_text_for_linkedin(self, text: str) -> str:
        """
        AGGRESSIVE LINKEDIN URL NORMALIZATION
        
        Handles broken/split LinkedIn URLs from PDF extraction:
        - "linkedin.com / in / username"
        - "linkedin.com\n/in\n/username"  
        - "www.linkedin.com in / john-doe"
        - URLs with unicode artifacts and invisible characters
        """
        if not text:
            return ""
        
        normalized = text
        
        # STEP 1: Remove zero-width and invisible unicode characters
        normalized = re.sub(r'[\u200B-\u200D\uFEFF\u00AD\u200E\u200F]', '', normalized)
        
        # STEP 2: Normalize unicode whitespace to regular space
        normalized = re.sub(r'[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]', ' ', normalized)
        
        # STEP 3: Normalize all line breaks to space (for URL reconstruction)
        normalized = normalized.replace('\r\n', ' ').replace('\r', ' ').replace('\n', ' ')
        
        # STEP 4: Remove common PDF artifacts
        normalized = re.sub(r'\[link\]', '', normalized, flags=re.IGNORECASE)
        normalized = re.sub(r'\(link\)', '', normalized, flags=re.IGNORECASE)
        normalized = re.sub(r'\[hyperlink\]', '', normalized, flags=re.IGNORECASE)
        
        # STEP 5: Collapse multiple spaces to single space
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # STEP 6: AGGRESSIVE LinkedIn URL reconstruction
        # Handle URLs split by spaces/newlines like "linkedin.com / in / username"
        normalized = re.sub(
            r'linkedin\.com\s*[/\s]+\s*in\s*[/\s]+\s*([A-Za-z0-9._-]+)',
            r'linkedin.com/in/\1',
            normalized,
            flags=re.IGNORECASE
        )
        
        # Handle "www.linkedin.com in / username" (missing slash after .com)
        normalized = re.sub(
            r'(?:www\.)?linkedin\.com\s+in\s*[/\s]+\s*([A-Za-z0-9._-]+)',
            r'linkedin.com/in/\1',
            normalized,
            flags=re.IGNORECASE
        )
        
        # Handle "linkedin . com / in / username" (spaces around dots)
        normalized = re.sub(
            r'linkedin\s*\.\s*com\s*[/\s]+\s*in\s*[/\s]+\s*([A-Za-z0-9._-]+)',
            r'linkedin.com/in/\1',
            normalized,
            flags=re.IGNORECASE
        )
        
        # Handle "linkedin.com/in/ username" (space after /in/)
        normalized = re.sub(
            r'linkedin\.com/in/\s+([A-Za-z0-9._-]+)',
            r'linkedin.com/in/\1',
            normalized,
            flags=re.IGNORECASE
        )
        
        # Handle pub URLs similarly
        normalized = re.sub(
            r'linkedin\.com\s*[/\s]+\s*pub\s*[/\s]+\s*([A-Za-z0-9._-]+)',
            r'linkedin.com/pub/\1',
            normalized,
            flags=re.IGNORECASE
        )
        
        # STEP 7: Normalize protocol variations
        normalized = re.sub(r'https?\s*:\s*/\s*/\s*', 'https://', normalized, flags=re.IGNORECASE)
        
        # STEP 8: Remove spaces around slashes in URLs
        normalized = re.sub(r'\s*/\s*', '/', normalized)
        
        # STEP 9: Fix double slashes that aren't protocol
        normalized = re.sub(r'([^:])//+', r'\1/', normalized)
        
        return normalized.strip()
    
    # Blocklist for LinkedIn username validation
    LINKEDIN_USERNAME_BLOCKLIST = {
        'education', 'experience', 'skills', 'projects', 'publications',
        'summary', 'resume', 'github', 'linkedin', 'contact', 'references',
        'certifications', 'awards', 'interests', 'languages', 'objective',
        'profile', 'work', 'employment', 'portfolio', 'achievements',
        'activities', 'volunteer', 'training', 'courses', 'hobbies',
    }
    
    def _is_valid_linkedin_username(self, username: str) -> bool:
        """
        Validate LinkedIn username with strict rules.
        
        A valid LinkedIn username MUST:
        1. Contain at least one lowercase letter [a-z]
        2. Be longer than 3 characters
        3. Contain NO spaces
        4. NOT be fully uppercase
        5. NOT match blocklisted keywords
        """
        if not username:
            return False
        
        # Must be longer than 3 characters
        if len(username) <= 3:
            return False
        
        # Must contain NO spaces
        if re.search(r'\s', username):
            return False
        
        # Must contain at least one lowercase letter [a-z]
        if not re.search(r'[a-z]', username):
            return False
        
        # Must NOT be fully uppercase
        if username == username.upper():
            return False
        
        # Must NOT match blocklisted keywords (case-insensitive)
        if username.lower() in self.LINKEDIN_USERNAME_BLOCKLIST:
            return False
        
        # Must be alphanumeric with ._- only
        if not re.match(r'^[A-Za-z0-9._-]+$', username):
            return False
        
        return True
    
    def _clean_linkedin_username(self, username: str) -> Optional[str]:
        """
        Clean and validate LinkedIn username.
        Removes trailing punctuation, validates format, applies blocklist.
        """
        if not username:
            return None
        
        # Remove trailing punctuation, spaces, and common URL artifacts
        cleaned = re.sub(r'[.,;:!?\s]+$', '', username)
        cleaned = re.sub(r'[)\]}>]+$', '', cleaned)
        cleaned = re.sub(r'[/\\]+$', '', cleaned)
        cleaned = cleaned.strip()
        
        # Remove query parameters if present
        if '?' in cleaned:
            cleaned = cleaned.split('?')[0]
        
        # Remove hash fragments if present
        if '#' in cleaned:
            cleaned = cleaned.split('#')[0]
        
        # CRITICAL: Apply strict validation rules
        # This prevents false positives like "EDUCATION", "Github", etc.
        if not self._is_valid_linkedin_username(cleaned):
            return None
        
        # Final length check
        if len(cleaned) > 100:
            return None
        
        return cleaned
    
    def _extract_linkedin_url(self, text: str) -> Optional[str]:
        """
        IMPROVED LINKEDIN EXTRACTION WITH TEXT NORMALIZATION
        
        Handles:
        - Unicode characters and zero-width spaces
        - Icon-based LinkedIn text split across lines
        - Various URL formats (http/https, www, /in/, /pub/, /profile/)
        - Text-only cases like "LinkedIn: username"
        - Trailing punctuation and whitespace cleanup
        """
        if not text:
            return None
        
        # STEP 1: Normalize text BEFORE extraction
        normalized_text = self._normalize_text_for_linkedin(text)
        
        # STEP 2: Try full URL patterns first (highest confidence)
        full_url_patterns = [
            r'https?://(?:www\.)?linkedin\.com/in/([A-Za-z0-9._%-]{3,100})',
            r'https?://(?:www\.)?linkedin\.com/pub/([A-Za-z0-9._%-]{3,100})',
            r'https?://(?:www\.)?linkedin\.com/profile/view\?id=([A-Za-z0-9._%-]{3,100})',
        ]
        
        for pattern in full_url_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                username = self._clean_linkedin_username(match.group(1))
                if username:
                    return f"https://linkedin.com/in/{username}"
        
        # STEP 3: Try partial URL patterns (no protocol)
        partial_url_patterns = [
            r'(?:www\.)?linkedin\.com/in/([A-Za-z0-9._%-]{3,100})',
            r'(?:www\.)?linkedin\.com/pub/([A-Za-z0-9._%-]{3,100})',
            r'linkedin\.com/profile/view\?id=([A-Za-z0-9._%-]{3,100})',
        ]
        
        for pattern in partial_url_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                username = self._clean_linkedin_username(match.group(1))
                if username:
                    return f"https://linkedin.com/in/{username}"
        
        # STEP 4: Try text-based patterns (LinkedIn: username, LinkedIn - username, etc.)
        # CRITICAL: These patterns are more prone to false positives, so we apply strict validation
        text_patterns = [
            r'linkedin\s*[:\-|]\s*(?:profile|url|link)?\s*[:\-|]?\s*([A-Za-z0-9._-]{4,60})',
            r'linkedin\s*[:\-|]\s*@?([A-Za-z0-9._-]{4,60})',
        ]
        
        for pattern in text_patterns:
            match = re.search(pattern, normalized_text, re.IGNORECASE)
            if match:
                username = match.group(1).strip()
                # STRICT validation: use _clean_linkedin_username which applies blocklist
                validated_username = self._clean_linkedin_username(username)
                if validated_username and '@' not in username and 'http' not in username and '.com' not in username:
                    return f"https://linkedin.com/in/{validated_username}"
        
        # NOTE: Removed overly permissive patterns that caused false positives
        return None
    
    def _normalize_text_for_phone(self, text: str) -> str:
        """
        Normalize text for phone extraction.
        Handles PDF layout quirks and unicode issues.
        """
        if not text:
            return ""
        
        normalized = text
        
        # Remove zero-width and invisible characters
        normalized = re.sub(r'[\u200B-\u200D\uFEFF\u00AD]', '', normalized)
        
        # Normalize unicode whitespace
        normalized = re.sub(r'[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]', ' ', normalized)
        
        # Normalize line breaks that might split phone numbers
        normalized = normalized.replace('\r\n', ' ').replace('\r', ' ').replace('\n', ' ')
        
        # Collapse multiple spaces
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # Normalize common phone label prefixes
        normalized = re.sub(r'(?:telephone|telefono|fax)[:\s]*', 'phone: ', normalized, flags=re.IGNORECASE)
        
        return normalized.strip()
    
    def _is_valid_phone_number(self, digits: str) -> bool:
        """
        Validate phone number digits.
        
        Rules:
        - Valid length: 10-15 digits
        - NOT a year (1900-2099)
        - NOT repeated digits
        - NOT all zeros
        - Has at least 3 unique digits
        """
        if not digits:
            return False
        
        # Valid length: 10-15 digits
        if len(digits) < 10 or len(digits) > 15:
            return False
        
        # Reject year-like numbers
        if re.match(r'^(19|20)\d{2}$', digits):
            return False
        
        # Reject if more than 6 consecutive repeated digits
        if re.search(r'(\d)\1{6,}', digits):
            return False
        
        # Reject all zeros
        if re.match(r'^0+$', digits):
            return False
        
        # Reject all same digit
        if re.match(r'^(\d)\1+$', digits):
            return False
        
        # Must have at least 3 unique digits
        unique_digits = len(set(digits))
        if unique_digits < 3:
            return False
        
        # Reject common non-phone patterns
        if digits.startswith('1234567890') or digits.startswith('0987654321'):
            return False
        
        return True
    
    def _normalize_phone_output(self, digits: str) -> str:
        """
        Normalize phone number for output.
        Preserves country code, formats consistently.
        """
        if not digits:
            return ""
        
        # 11 digit US number with country code
        if len(digits) == 11 and digits.startswith('1'):
            return f"+1 {digits[1:4]} {digits[4:7]} {digits[7:]}"
        
        # 10 digit US number
        if len(digits) == 10:
            return f"+1 {digits[0:3]} {digits[3:6]} {digits[6:]}"
        
        # International number
        if len(digits) > 10:
            return f"+{digits}"
        
        return digits
    
    def _extract_phone_number(self, text: str) -> Optional[str]:
        """
        IMPROVED PHONE EXTRACTION WITH EXPANDED FORMAT SUPPORT
        
        Supports:
        - +1-XXX-XXX-XXXX
        - +1 XXX XXX XXXX  
        - XXX.XXX.XXXX
        - (XXX) XXX-XXXX
        - XXX-XXX-XXXX
        - XXXXXXXXXX (10 digits no separators)
        - International formats with 10-15 digits
        """
        if not text:
            return None
        
        # Normalize text for phone extraction
        normalized_text = self._normalize_text_for_phone(text)
        
        # EXPANDED phone patterns
        phone_patterns = [
            # US formats with country code
            r'\+1[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b',
            
            # US formats: (XXX) XXX-XXXX
            r'\((\d{3})\)[\s.-]?(\d{3})[\s.-]?(\d{4})\b',
            
            # US formats: XXX-XXX-XXXX, XXX.XXX.XXXX, XXX XXX XXXX
            r'\b(\d{3})[\s.-](\d{3})[\s.-](\d{4})\b',
            
            # 10 digits with optional leading 1
            r'\b1?(\d{3})(\d{3})(\d{4})\b',
            
            # International formats
            r'\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}\b',
            
            # Formats with area code in parentheses
            r'\(?(\d{3})\)?[\s.\-/]?(\d{3})[\s.\-/]?(\d{4})\b',
            
            # Phone with prefix labels
            r'(?:tel|phone|cell|mobile|ph)[:\s]*\+?1?[\s.-]?\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})\b',
        ]
        
        for pattern in phone_patterns:
            matches = re.finditer(pattern, normalized_text, re.IGNORECASE)
            for match in matches:
                candidate = match.group(0)
                digits = re.sub(r'\D', '', candidate)
                
                # Validate phone number
                if not self._is_valid_phone_number(digits):
                    continue
                
                return self._normalize_phone_output(digits)
        
        return None
    
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

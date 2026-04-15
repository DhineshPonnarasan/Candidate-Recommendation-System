import os
import tempfile

from services.document_service import DocumentProcessor


def test_clean_text_preserves_line_structure():
    processor = DocumentProcessor()
    raw = "  JOHN   DOE  \n\n  EXPERIENCE   \nPython   Developer   "

    cleaned = processor._clean_text(raw)

    assert "\n" in cleaned
    lines = cleaned.split("\n")
    assert lines[0] == "JOHN DOE"
    assert lines[1] == "EXPERIENCE"
    assert lines[2] == "Python Developer"


def test_extract_resume_sections_from_multiline_text():
    processor = DocumentProcessor()
    text = """John Doe
EXPERIENCE
Built APIs in Python
EDUCATION
B.S. Computer Science
SKILLS
Python, Flask, SQL
"""

    sections = processor.extract_resume_sections(text)

    assert "Built APIs in Python" in sections["experience"]
    assert "B.S. Computer Science" in sections["education"]
    assert "Python, Flask, SQL" in sections["skills"]


def test_extract_txt_fallback_non_utf8():
    processor = DocumentProcessor()
    fd, path = tempfile.mkstemp(suffix=".txt")
    os.close(fd)
    try:
        with open(path, "wb") as f:
            f.write("Jose\xe9 Resume".encode("latin-1"))

        content = processor.extract_text(path, "txt")
        assert "Resume" in content
    finally:
        if os.path.exists(path):
            os.remove(path)


def test_doc_extension_returns_empty_string():
    processor = DocumentProcessor()
    assert processor.extract_text("fake.doc", "doc") == ""

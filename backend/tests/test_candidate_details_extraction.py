from app.services.document_service import DocumentProcessor, extract_candidate_details


def test_extract_candidate_details_happy_path():
    processor = DocumentProcessor()
    text = """John Doe
Senior Software Engineer
john.doe@example.com
+1 2025550123
https://www.linkedin.com/in/john-doe/
"""

    details = processor.extract_candidate_details(text)

    assert details["name"] == "John Doe"
    assert details["email"] == "john.doe@example.com"
    assert details["phone"] in {"+12025550123", "2025550123"}
    assert "linkedin.com/in/john-doe" in details["linkedin"].lower()


def test_extract_candidate_details_rejects_filename_like_name():
    text = """john_doe_resume.pdf
Email: john.doe@example.com
+91 9876543210
linkedin.com/in/john-doe
"""

    details = extract_candidate_details(text)

    assert details["name"] == "Unknown Candidate"
    assert details["email"] == "john.doe@example.com"
    assert details["phone"]
    assert details["linkedin"].startswith("https://")


def test_extract_candidate_details_not_found_defaults():
    details = extract_candidate_details("No contacts here")

    assert details["name"] == "Unknown Candidate"
    assert details["email"] == "Not Found"
    assert details["phone"] == "Not Found"
    assert details["linkedin"] == "Not Found"

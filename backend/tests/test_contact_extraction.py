from app.services.document_service import DocumentProcessor


def test_extract_contact_info_with_linkedin_url_and_phone():
    processor = DocumentProcessor()
    text = """John Doe
john.doe@example.com
+1 (202) 555-0123
https://www.linkedin.com/in/john-doe-123
"""

    info = processor.extract_contact_info(text)

    assert info["name"] == "John Doe"
    assert info["email"] == "john.doe@example.com"
    assert "+1" in (info["phone"] or "") or "202" in (info["phone"] or "")
    assert info["linkedin"]
    assert "linkedin.com/in/john-doe-123" in info["linkedin"].lower()


def test_extract_contact_info_name_fallback_from_email():
    processor = DocumentProcessor()
    text = """resume
contact
sarah_connor1984@example.com
"""

    info = processor.extract_contact_info(text)

    assert info["email"] == "sarah_connor1984@example.com"
    assert info["name"] is None

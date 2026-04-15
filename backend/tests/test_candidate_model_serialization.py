import numpy as np

from models.candidate_model import Candidate


def test_embedding_roundtrip_json_bytes():
    embedding = np.array([0.1, 0.2, 0.3], dtype=np.float32)

    serialized = Candidate._serialize_embedding(embedding)
    restored = Candidate._deserialize_embedding(serialized)

    assert restored is not None
    assert np.allclose(restored, embedding)


def test_skills_roundtrip_json_string():
    skills = ["Python", "Flask", "SQL"]

    serialized = Candidate._serialize_skills(skills)
    restored = Candidate._deserialize_skills(serialized)

    assert restored == skills

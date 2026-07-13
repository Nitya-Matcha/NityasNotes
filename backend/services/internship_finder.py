from services.notes_service import save_note

def create_sample_internship_note(db):
    text = """
Summer 2027 Internship Found

Company: NVIDIA

Role: Ignite Intern

Location: Santa Clara, CA

Apply:
https://www.nvidia.com
"""

    return save_note(db, text)
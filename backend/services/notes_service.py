import models


def save_note(db, text):
    new_note = models.Note(
        text=text
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note
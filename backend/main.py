from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal, Base
import models

class NoteCreate(BaseModel):
    text: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE NOTE
@app.post("/notes")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    new_note = models.Note(text=note.text)

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note

# GET NOTES
@app.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not note:
        return {"error": "Note not found"}

    db.delete(note)
    db.commit()

    return {"message": "note deleted"}

@app.put("/notes/{note_id}")
def update_note(note_id: int, updated_note: dict, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not note:
        return {"error": "Note not found"}

    note.text = updated_note["text"]

    db.commit()
    db.refresh(note)

    return note


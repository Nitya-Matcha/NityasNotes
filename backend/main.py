from services.notes_service import save_note
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import engine, SessionLocal, Base
import models

# IMPORTANT: create app FIRST
app = FastAPI()

# IMPORTANT: CORS MUST BE IMMEDIATELY AFTER app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create tables
Base.metadata.create_all(bind=engine)

# DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# request schema
class NoteCreate(BaseModel):
    text: str

# CREATE
@app.post("/notes")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    return save_note(db, note.text)

# READ
@app.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()

# DELETE
@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        return {"error": "Note not found"}

    db.delete(note)
    db.commit()
    return {"message": "deleted"}

# UPDATE
@app.put("/notes/{note_id}")
def update_note(note_id: int, updated: NoteCreate, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        return {"error": "Note not found"}

    note.text = updated.text
    db.commit()
    db.refresh(note)
    return note
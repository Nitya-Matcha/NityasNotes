from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal, Base
import models

# -------------------------
# Schemas (Pydantic)
# -------------------------

class NoteCreate(BaseModel):
    text: str

class NoteUpdate(BaseModel):
    text: str


# -------------------------
# App setup
# -------------------------

app = FastAPI()

# CORS (safe for dev + deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later when deploying frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Create DB tables
# -------------------------

Base.metadata.create_all(bind=engine)


# -------------------------
# DB dependency
# -------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# ROUTES
# -------------------------

# CREATE NOTE
@app.post("/notes")
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    new_note = models.Note(text=note.text)

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


# GET ALL NOTES
@app.get("/notes")
def get_notes(db: Session = Depends(get_db)):
    return db.query(models.Note).all()


# DELETE NOTE
@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return {"message": "note deleted"}


# UPDATE NOTE
@app.put("/notes/{note_id}")
def update_note(note_id: int, updated_note: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.text = updated_note.text

    db.commit()
    db.refresh(note)

    return note
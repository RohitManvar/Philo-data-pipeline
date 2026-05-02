from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import SavedPhilosopher

router = APIRouter(prefix="/saved", tags=["saved"])


class SaveIn(BaseModel):
    user_email: str
    slug: str
    philosopher_name: str
    era: str | None = None
    school: str | None = None


@router.get("/{user_email}")
def get_saved(user_email: str, db: Session = Depends(get_db)):
    items = db.query(SavedPhilosopher).filter(
        SavedPhilosopher.user_email == user_email
    ).order_by(SavedPhilosopher.saved_at.desc()).all()
    return [
        {
            "slug": i.slug,
            "name": i.philosopher_name,
            "era": i.era,
            "school": i.school,
            "savedAt": i.saved_at.isoformat() if i.saved_at else "",
        }
        for i in items
    ]


@router.post("", status_code=201)
def save_philosopher(body: SaveIn, db: Session = Depends(get_db)):
    existing = db.query(SavedPhilosopher).filter(
        SavedPhilosopher.user_email == body.user_email,
        SavedPhilosopher.slug == body.slug,
    ).first()
    if existing:
        return {"saved": True}
    item = SavedPhilosopher(
        user_email=body.user_email,
        slug=body.slug,
        philosopher_name=body.philosopher_name,
        era=body.era,
        school=body.school,
    )
    db.add(item)
    db.commit()
    return {"saved": True}


@router.delete("/{user_email}/{slug}")
def unsave_philosopher(user_email: str, slug: str, db: Session = Depends(get_db)):
    item = db.query(SavedPhilosopher).filter(
        SavedPhilosopher.user_email == user_email,
        SavedPhilosopher.slug == slug,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(item)
    db.commit()
    return {"saved": False}

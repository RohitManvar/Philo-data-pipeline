from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

import sys
sys.path.append("..")

from database import get_db
from models import Philosopher
from schemas import PhilosopherOut, PhilosopherList

router = APIRouter(prefix="/philosophers", tags=["philosophers"])


@router.get("", response_model=PhilosopherList)
def list_philosophers(
    page:  int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db:    Session = Depends(get_db),
):
    offset = (page - 1) * limit
    total = db.query(func.count(Philosopher.id)).scalar()
    items = db.query(Philosopher).offset(offset).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "data": items}


@router.get("/search", response_model=PhilosopherList)
def search_philosophers(
    q:     str = Query(..., min_length=1),
    page:  int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db:    Session = Depends(get_db),
):
    offset = (page - 1) * limit
    pattern = f"%{q}%"
    query = db.query(Philosopher).filter(
        or_(
            Philosopher.philosopher_name.ilike(pattern),
            Philosopher.intro.ilike(pattern),
            Philosopher.main_ideas.ilike(pattern),
        )
    )
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "data": items}


@router.get("/filter", response_model=PhilosopherList)
def filter_philosophers(
    era:   str | None = Query(None),
    school: str | None = Query(None),
    page:  int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db:    Session = Depends(get_db),
):
    offset = (page - 1) * limit
    query = db.query(Philosopher)
    if era:
        query = query.filter(Philosopher.era.ilike(f"%{era}%"))
    if school:
        query = query.filter(Philosopher.school.ilike(f"%{school}%"))
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return {"total": total, "page": page, "limit": limit, "data": items}


@router.get("/{slug}", response_model=PhilosopherOut)
def get_philosopher(slug: str, db: Session = Depends(get_db)):
    item = db.query(Philosopher).filter(Philosopher.slug == slug).first()
    if not item:
        raise HTTPException(status_code=404, detail="Philosopher not found")
    return item

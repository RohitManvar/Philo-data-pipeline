from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct

import sys
sys.path.append("..")

from database import get_db
from models import Philosopher

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/eras")
def list_eras(db: Session = Depends(get_db)):
    rows = db.query(distinct(Philosopher.era)).filter(Philosopher.era != None).all()
    return sorted([r[0] for r in rows])


@router.get("/schools")
def list_schools(db: Session = Depends(get_db)):
    rows = db.query(distinct(Philosopher.school)).filter(Philosopher.school != None).all()
    return sorted([r[0] for r in rows])

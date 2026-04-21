from pydantic import BaseModel
from datetime import datetime


class PhilosopherOut(BaseModel):
    id:               int
    philosopher_name: str
    slug:             str
    intro:            str
    birth:            str | None
    death:            str | None
    era:              str | None
    school:           str | None
    main_ideas:       str | None
    influenced:       str | None
    influenced_by:    str | None
    image_url:        str | None
    wikipedia_url:    str | None
    scraped_at:       datetime | None

    model_config = {"from_attributes": True}


class PhilosopherList(BaseModel):
    total:  int
    page:   int
    limit:  int
    data:   list[PhilosopherOut]

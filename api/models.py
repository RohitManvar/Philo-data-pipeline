from sqlalchemy import Column, Integer, Text, TIMESTAMP, func
from database import Base


class Philosopher(Base):
    __tablename__ = "philosophers"

    id               = Column(Integer, primary_key=True, index=True)
    philosopher_name = Column(Text, nullable=False)
    slug             = Column(Text, nullable=False, unique=True)
    intro            = Column(Text, nullable=False)
    birth            = Column(Text)
    death            = Column(Text)
    era              = Column(Text)
    school           = Column(Text)
    main_ideas       = Column(Text)
    influenced       = Column(Text)
    influenced_by    = Column(Text)
    image_url        = Column(Text)
    wikipedia_url    = Column(Text)
    scraped_at       = Column(TIMESTAMP)
    created_at       = Column(TIMESTAMP, server_default=func.now())

from sqlalchemy import Column, Integer, Text, TIMESTAMP, UniqueConstraint, func
from database import Base


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(Text, unique=True, nullable=False, index=True)
    username      = Column(Text, unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at    = Column(TIMESTAMP, server_default=func.now())


class SavedPhilosopher(Base):
    __tablename__ = "saved_philosophers"
    __table_args__ = (UniqueConstraint("user_email", "slug"),)

    id              = Column(Integer, primary_key=True, index=True)
    user_email      = Column(Text, nullable=False, index=True)
    slug            = Column(Text, nullable=False)
    philosopher_name = Column(Text, nullable=False)
    era             = Column(Text)
    school          = Column(Text)
    note            = Column(Text)
    saved_at        = Column(TIMESTAMP, server_default=func.now())


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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine
from models import Base
from routers import philosophers, categories
from routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: could not create tables ({e})")
    yield

app = FastAPI(title="Enlyghten API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(philosophers.router)
app.include_router(categories.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Enlyghten API is running"}

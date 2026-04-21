from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import philosophers, categories

app = FastAPI(title="Enlyghten API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(philosophers.router)
app.include_router(categories.router)


@app.get("/")
def root():
    return {"message": "Enlyghten API is running"}

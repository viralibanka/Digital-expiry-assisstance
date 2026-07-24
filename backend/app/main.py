from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.models.user import User
from app.models.product import Product

from app.routers.auth import router as auth_router
from app.routers.product import router as product_router
from app.routers.ai import router as ai_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ExpiryVault API",
    description="Backend API for ExpiryVault",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(product_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {"message": "Welcome to ExpiryVault API 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy"}
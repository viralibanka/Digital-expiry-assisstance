from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.product import Product
from app.models.user import User
from app.services.ai_service import generate_ai_response
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.post("/chat")
def chat(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    question = data.get("question", "")

    products = db.query(Product).filter(
        Product.owner_id == current_user.id
    ).all()

    answer = generate_ai_response(
        question,
        products
    )

    return {
        "answer": answer
    }
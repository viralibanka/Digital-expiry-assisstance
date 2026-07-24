from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product: ProductCreate, user: User):
    new_product = Product(
        product_name=product.product_name,
        category=product.category,
        quantity=product.quantity,
        manufacture_date=product.manufacture_date,
        expiry_date=product.expiry_date,
        owner_id=user.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


def get_products(db: Session, user: User):
    return db.query(Product).filter(Product.owner_id == user.id).all()


def get_product(db: Session, product_id: int, user: User):
    return db.query(Product).filter(
        Product.id == product_id,
        Product.owner_id == user.id
    ).first()


def update_product(db: Session, product_id: int, product: ProductUpdate, user: User):
    db_product = get_product(db, product_id, user)

    if not db_product:
        return None

    db_product.product_name = product.product_name
    db_product.category = product.category
    db_product.quantity = product.quantity
    db_product.manufacture_date = product.manufacture_date
    db_product.expiry_date = product.expiry_date

    db.commit()
    db.refresh(db_product)

    return db_product


def delete_product(db: Session, product_id: int, user: User):
    db_product = get_product(db, product_id, user)

    if not db_product:
        return False

    db.delete(db_product)
    db.commit()

    return True


def get_expired_products(db: Session, user: User):
    today = date.today()

    return db.query(Product).filter(
        Product.owner_id == user.id,
        Product.expiry_date < today
    ).all()


def get_expiring_products(db: Session, days: int, user: User):
    today = date.today()
    future = today + timedelta(days=days)

    return db.query(Product).filter(
        Product.owner_id == user.id,
        Product.expiry_date >= today,
        Product.expiry_date <= future
    ).all()


def dashboard_summary(db: Session, user: User):
    total = db.query(Product).filter(Product.owner_id == user.id).count()
    expired = len(get_expired_products(db, user))
    seven = len(get_expiring_products(db, 7, user))
    thirty = len(get_expiring_products(db, 30, user))

    return {
        "total_products": total,
        "expired_products": expired,
        "expiring_in_7_days": seven,
        "expiring_in_30_days": thirty
    }
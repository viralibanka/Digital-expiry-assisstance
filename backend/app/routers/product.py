from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse, StreamingResponse
from openpyxl import Workbook
from app.services.pdf_service import generate_products_pdf

from app.db.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import (
    create_product,
    get_products,
    update_product,
    delete_product,
    get_expired_products,
    get_expiring_products,
    dashboard_summary,
)
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post("/", response_model=ProductResponse)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_product(db, product, current_user)


@router.get("/", response_model=list[ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_products(db, current_user)


@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = update_product(db, product_id, product, current_user)

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return updated


@router.delete("/{product_id}")
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = delete_product(db, product_id, current_user)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted successfully"
    }


@router.get("/expired", response_model=list[ProductResponse])
def expired_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_expired_products(db, current_user)


@router.get("/expiring/{days}", response_model=list[ProductResponse])
def expiring_products(
    days: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_expiring_products(db, days, current_user)


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return dashboard_summary(db, current_user)
@router.get("/export")
def export_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    products = db.query(Product).filter(
        Product.owner_id == current_user.id
    ).all()

    wb = Workbook()

    ws = wb.active
    ws.title = "Products"

    ws.append([
        "Product Name",
        "Category",
        "Quantity",
        "Manufacture Date",
        "Expiry Date"
    ])

    for product in products:

        ws.append([
            product.product_name,
            product.category,
            product.quantity,
            str(product.manufacture_date),
            str(product.expiry_date)
        ])

    file_name = "products.xlsx"

    wb.save(file_name)

    return FileResponse(
        file_name,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=file_name
    )
@router.get(
    "/export-pdf",
    response_class=StreamingResponse
)
def export_products_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    products = db.query(Product).filter(
        Product.owner_id == current_user.id
    ).all()

    pdf_file = generate_products_pdf(products)

    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=expiryvault_products.pdf"
        }
    )
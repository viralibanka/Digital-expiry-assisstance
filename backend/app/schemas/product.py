from datetime import date
from pydantic import BaseModel


class ProductCreate(BaseModel):
    product_name: str
    category: str
    quantity: int
    manufacture_date: date
    expiry_date: date


class ProductUpdate(BaseModel):
    product_name: str
    category: str
    quantity: int
    manufacture_date: date
    expiry_date: date


class ProductResponse(BaseModel):
    id: int
    product_name: str
    category: str
    quantity: int
    manufacture_date: date
    expiry_date: date
    owner_id: int

    class Config:
        from_attributes = True
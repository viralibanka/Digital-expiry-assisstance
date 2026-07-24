from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    manufacture_date = Column(Date)
    expiry_date = Column(Date, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User")
from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

import database_model
from database import engine, session
from model import Product

database_model.Base.metadata.create_all(bind=engine)
app = FastAPI()


@app.get("/")
def greet():
    return "Welcome To Lesson-1"


products_list = [
    Product(
        id=1,
        name="Wireless Mouse",
        description="Ergonomic 2.4GHz wireless mouse",
        price=25.99,
        quantity=50,
    ),
    Product(
        id=2,
        name="Mechanical Keyboard",
        description="RGB backlit mechanical keyboard with blue switches",
        price=79.99,
        quantity=30,
    ),
    Product(
        id=3,
        name="Gaming Monitor",
        description="27-inch 4K 144Hz IPS gaming monitor",
        price=349.99,
        quantity=15,
    ),
    Product(
        id=4,
        name="HD Webcam",
        description="1080p autofocus webcam with built-in microphone",
        price=45.50,
        quantity=25,
    ),
    Product(
        id=5,
        name="USB-C Hub",
        description="7-in-1 multi-port adapter with HDMI and SD card reader",
        price=29.99,
        quantity=40,
    ),
]


def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()


def init_db():
    db = session()
    count = db.query(database_model.Product).count()
    if count == 0:
        for items in products_list:
            db.add(database_model.Product(**items.model_dump()))
        db.commit()


init_db()


@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    db_products = db.query(database_model.Product).all()
    return db_products


@app.get("/products/{id}")
def get_product_by_id(id: int, db: Session = Depends(get_db)):
    db_product = (
        db.query(database_model.Product).filter(database_model.Product.id == id).first()
    )
    if db_product:
        return db_product
    return "No Products"


@app.post("/products")
def add_product(product: Product, db: Session = Depends(get_db)):
    db_product = database_model.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    return db_product


@app.put("/products")
def update_product(id: int, product: Product, db: Session = Depends(get_db)):
    db_product = (
        db.query(database_model.Product).filter(database_model.Product.id == id).first()
    )
    if db_product:
        db_product.name = product.name
        db_product.description = product.description
        db_product.price = product.price
        db_product.quantity = product.quantity
        db.commit()
        return "Prodcut Added Successfully"
    else:
        return "No Product Found"


@app.delete("/products")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = (
        db.query(database_model.Product).filter(database_model.Product.id == id).first()
    )
    if db_product:
        db.delete(db_product)
        return "Prodcut Deleted Successfully"
    else:
        return "No Product Found"

from fastapi import FastAPI

from model import Product

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


@app.get("/products")
def get_products():
    return products_list

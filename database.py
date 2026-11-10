from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

url = "postgresql://postgres:deed@localhost:5432/fastapi_db"

engine = create_engine(url)

session = sessionmaker(autoflush=False, bind=engine)

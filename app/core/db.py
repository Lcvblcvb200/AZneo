from sqlalchemy.orm import sessionmaker
from app.db.db import db

session = sessionmaker(bind=db)

def getsession():
    try:
        session = session()
        yield session
    finally:
        session.close()
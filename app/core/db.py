from sqlalchemy.orm import sessionmaker
from app.db.db import db

Session = sessionmaker(bind=db)

def getsession():
    try:
        session = Session()
        yield session
    finally:
        session.close()
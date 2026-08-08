from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from backend.app.core.config import DATABASE_URL

db = create_engine(DATABASE_URL)
Base = declarative_base()

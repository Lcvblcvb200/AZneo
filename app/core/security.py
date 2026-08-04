from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from app.core.config import ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from jose import jwt, JWTError
from app.core.db import getsession
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import User

bcrypt_context = CryptContext(schemes=["bcrypt"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/signin")

def create_token(iduser, token_duration=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    exp_data = datetime.now(timezone.utc) + token_duration
    dic_info = {"sub": str(iduser), "exp": exp_data}
    token = jwt.encode(dic_info, SECRET_KEY, algorithm=ALGORITHM)
    return token

def token_verify(token: str = Depends(oauth2_scheme), session: Session = Depends(getsession)):
    try:
        decodified_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        userid = decodified_token.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")
    user = session.query(User).filter(User.id == userid).first()
    if not user:
        raise HTTPException(status_code=401, detail="User Not Found")
    return user

def autenticate(email, password, session):
    query = session.query(User).filter(User.email == email).first()
    if not query:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    elif not bcrypt_context.verify(password, query.password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    return query

def passhash(password):
    hashed_pass = bcrypt_context.hash(password)
    return hashed_pass
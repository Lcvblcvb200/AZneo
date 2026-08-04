from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import create_token, autenticate , passhash

class UserService:
    def __init__(self, session: Session):
        self.session = session

    def signup(self, name: str, email: str, password: str) -> str:
        queryuser = self.session.query(User).filter(User.email == email).first()
        if queryuser:
            raise HTTPException(status_code=401, detail="This User Already Exists")
        else:
            cript_pass = passhash(password)
            new_user = User(name, email, cript_pass)
            self.session.add(new_user)
            token = create_token(new_user.id)
            self.session.commit()
            return token
        
    def signin(self, email: str, password: str) -> str:
        auth_user = autenticate(email, password, self.session)
        access_token = create_token(auth_user.id)
        return access_token
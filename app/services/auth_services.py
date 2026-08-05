from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.models import User
from app.core.security import create_token, autenticate, passhash

class UserService:
    def __init__(self, session: Session):
        self.session = session

    def signup(self, name: str, email: str, password: str, cpf: str, rg: str) -> str:
        queryuser = self.session.query(User).filter(User.email == email).first()
        if queryuser:
            raise HTTPException(status_code=401, detail="This User Already Exists")
        else:
            cript_pass = passhash(password)
            new_user = User(name, email, cript_pass, cpf, rg, role="customer")
            self.session.add(new_user)
            self.session.commit()
            token = create_token(new_user.id_user, new_user.role)
            return token
        
    def signin(self, email: str, password: str) -> str:
        auth_user = autenticate(email, password, self.session)
        token = create_token(auth_user.id_user, auth_user.role)
        return token
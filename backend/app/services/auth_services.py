from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models.models import User, UserCompany
from backend.app.core.security import create_token, autenticate, passhash

class UserService:
    def __init__(self, session: Session):
        self.session = session

    def signup(self, name: str, email: str, password: str, cpf: str) -> str:
        queryuser = self.session.query(User).filter(User.email == email).first()
        if queryuser:
            raise HTTPException(status_code=401, detail="This User Already Exists")
        else:
            cript_pass = passhash(password)
            new_user = User(name, email, cript_pass, cpf, role="customer")
            self.session.add(new_user)
            self.session.commit()
            token = create_token(new_user.id_user, new_user.role)
            return token

    def signup_company(self, name_f: str, name_s: str, cnpj: str, ie: str, email: str, password: str) -> str:
        queryuser = self.session.query(User).filter(User.email == email).first()
        if queryuser:
            raise HTTPException(status_code=401, detail="This User Already Exists")
        else:
            cript_pass = passhash(password)
            new_user = User(name_f, email, cript_pass, cpf=None, role="company")
            self.session.add(new_user)
            self.session.flush()
            new_company = UserCompany(new_user.id_user, name_f, name_s, cnpj, ie)
            self.session.add(new_company)
            self.session.commit()
            self.session.refresh(new_user)
            token = create_token(new_user.id_user, new_user.role)
            return token

    def signin(self, email: str, password: str) -> str:
        auth_user = autenticate(email, password, self.session)
        token = create_token(auth_user.id_user, auth_user.role)
        return token
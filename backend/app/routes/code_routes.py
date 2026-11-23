from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.db import getsession
from backend.app.core.security import is_admin
from backend.app.models.models import User
from backend.app.services.code_services import CodeService
from backend.app.schemas.codes_schemas import CodeCreate, CodeResponse

coderoute = APIRouter(prefix="/codes", tags=["Codes"])

@coderoute.post("/create", response_model=CodeResponse)
def create_code(data: CodeCreate, session: Session = Depends(getsession), user: User = Depends(is_admin)):
    code_service = CodeService(session)
    return code_service.create_code(data)

@coderoute.get("/view", response_model=list[CodeResponse])
def get_codes(session: Session = Depends(getsession), user: User = Depends(is_admin)):
    code_service = CodeService(session)
    return code_service.get_codes()

@coderoute.get("/{id_code}", response_model=CodeResponse)
def get_code_by_id(id_code: int, session: Session = Depends(getsession), user: User = Depends(is_admin)):
    code_service = CodeService(session)
    return code_service.get_code_by_id(id_code)

@coderoute.delete("/{id_code}", response_model=CodeResponse)
def deactivate_code(id_code: int, session: Session = Depends(getsession), user: User = Depends(is_admin)):
    code_service = CodeService(session)
    return code_service.deactivate_code(id_code)
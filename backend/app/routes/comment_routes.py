from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from backend.app.core.db import getsession
from backend.app.core.security import token_verify, is_admin
from backend.app.core.storage import save_comment_image
from backend.app.services.comment_services import CommentServices
from backend.app.models.models import User
from backend.app.schemas.comment_schemas import CommentOut, CommentPagination

commentroute = APIRouter(prefix="/comments", tags=["comments"])

@commentroute.post("/product/{product_id}", response_model=CommentOut)
def create_comment(product_id: int, content: str = Form(...), rating: float = Form(...), image: UploadFile | None = File(None), session: Session = Depends(getsession), user: User = Depends(token_verify)):
    comment_service = CommentServices(session)
    image_url = (save_comment_image(image) if image else None)
    comment = comment_service.create_comment(user.id_user, product_id, image_url, content, rating)
    return comment

@commentroute.get("/product/{product_id}", response_model=CommentPagination)
def view_comments(product_id: int, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    comment_service = CommentServices(session)
    return comment_service.view_comments(product_id)

@commentroute.put("/{comment_id}", response_model=CommentOut)
def update_comment(comment_id: int, content: str | None = Form(None), image: UploadFile | None = File(None), session: Session = Depends(getsession), user: User = Depends(token_verify)):
    comment_service = CommentServices(session)
    image_url = (save_comment_image(image) if image else None)
    return comment_service.update_comment(comment_id, user.id_user, content, image_url)

@commentroute.delete("/{comment_id}")
def delete_comment(comment_id: int, session: Session = Depends(getsession), user: User = Depends(token_verify)):
    comment_service = CommentServices(session)
    return comment_service.delete_comment(comment_id, user.id_user)


# abre o chat e resolve osproblemas q ele ja resolveu, e tbm resolve esse method not allowed do editar
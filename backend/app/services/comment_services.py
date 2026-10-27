from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from backend.app.models.models import Comments, User
from backend.app.storage.storage_service import StorageService
import math

class CommentServices:
    def __init__(self, session: Session):
        self.session = session
        self.storage = StorageService()

    def create_comment(self, id_user: int, id_product: int, image_url: UploadFile | None, content: str, rating: float) -> Comments:
        querycomment = self.session.query(Comments).filter(Comments.id_product == id_product, Comments.id_user == id_user).first()
        if querycomment:
            raise HTTPException(status_code=409, detail="You Already Commented On This Product")
        image_path = None
        if image_url is not None:
            image_path = self.storage.upload_image(file=image_url, folder="comments")
        
        comment = Comments(id_user, id_product, image_path, content, rating)
        self.session.add(comment)
        self.session.commit()
        self.session.refresh(comment)
        return comment

    def view_comments(self, id_product: int, page: int = 1, limit: int = 15):
            query = self.session.query(Comments).filter(Comments.id_product == id_product)
            total_comments = query.count()
            comments = (query.order_by(Comments.id_comment.desc()).offset((page - 1) * limit).limit(limit).all())
    
            return{
                "comments": comments,
                "page": page,
                "limit": limit,
                "total": total_comments,
                "total_pages": math.ceil(total_comments / limit)
            }

    def update_comment(self, id_comment: int, id_user: int, content: str | None = None, image_url: UploadFile | None = None):
        querycomment = self.session.query(Comments).filter(Comments.id_comment == id_comment, Comments.id_user == id_user).first()
        if not querycomment:
            raise HTTPException(status_code=404, detail="Comment Not Found")
        old_image_path = querycomment.image_url
        if content is not None:
            querycomment.content = content
        if image_url is not None:
            image_path = self.storage.upload_image(file=image_url, folder="comments")
            querycomment.image_url = image_path

        self.session.commit()
        self.session.refresh(querycomment)

        if image_url is not None and old_image_path and old_image_path.startswith("comments/"):
            self.storage.delete_image(old_image_path)
        return querycomment

    def delete_comment(self, id_comment: int, id_user: int):
        admin = self.session.query(User).filter(User.id_user == id_user, User.role == "admin").first()
        querycomment = self.session.query(Comments).filter(Comments.id_comment == id_comment).first()
        if not querycomment:
            raise HTTPException(status_code=404, detail="Comment Not Found")
        if querycomment.id_user != id_user and not admin:
            raise HTTPException(status_code=403, detail="You Don't Have Permission To Delete This Comment")
        image_path = querycomment.image_url 
        self.session.delete(querycomment)
        self.session.commit()
        if image_path and image_path.startswith("comments/"):
            self.storage.delete_image(image_path)
        return {"message": "Comment Deleted"}
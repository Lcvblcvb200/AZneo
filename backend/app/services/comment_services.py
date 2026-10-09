from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.app.models.models import Comments, User
import math

class CommentServices:
    def __init__(self, session: Session):
        self.session = session

    def create_comment(self, id_user: int, id_product: int, image_url: str | None, content: str, rating: float) -> Comments:
        querycomment = self.session.query(Comments).filter(Comments.id_product == id_product, Comments.id_user == id_user).first()
        if querycomment:
            raise HTTPException(status_code=409, detail="You Already Commented On This Product")
        else:
            comment = Comments(id_user, id_product, image_url, content, rating)
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

    def update_comment(self, id_comment: int, id_user: int, content: str | None = None, image_url: str | None = None):
        querycomment = self.session.query(Comments).filter(Comments.id_comment == id_comment, Comments.id_user == id_user).first()
        if not querycomment:
            raise HTTPException(status_code=404, detail="Comment Not Found")
        if content is not None:
            querycomment.content = content
        if image_url is not None:
            querycomment.image_url = image_url

        self.session.commit()
        self.session.refresh(querycomment)
        return querycomment

    def delete_comment(self, id_comment: int, id_user: int):
        admin = self.session.query(User).filter(User.id_user == id_user, User.role == "admin").first()
        querycomment = self.session.query(Comments).filter(Comments.id_comment == id_comment).first()
        if not querycomment:
            raise HTTPException(status_code=404, detail="Comment Not Found")
        if querycomment.id_user != id_user and not admin:
            raise HTTPException(status_code=403, detail="You Don't Have Permission To Delete This Comment") 
        self.session.delete(querycomment)
        self.session.commit()
        return {"message": "Comment Deleted"}

from main import db
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class UserCredentials(db.Model):

    __tablename__ = "user_credentials"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True)  # autoincrement auto True

    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    password: Mapped[str] = mapped_column(String)

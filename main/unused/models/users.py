
from main import db
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey


class Users(db.Model):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True)  # autoincrement auto True

    name: Mapped[str] = mapped_column(String, nullable=False)

    credential_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user_credentials.id"))

    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"))


from main import db
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class Roles(db.Model):

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True)  # autoincrement auto True

    role: Mapped[str] = mapped_column(String, nullable=False, unique=True)

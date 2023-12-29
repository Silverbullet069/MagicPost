
from main import db
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey


class ConsolPoints(db.Model):

    __tablename__ = "consol_points"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True)  # autoincrement auto True

    trade_point_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trade_points.id"))

    name: Mapped[str] = mapped_column(String, nullable=False)

    address: Mapped[str] = mapped_column(String, nullable=False)

    contact_info: Mapped[str] = mapped_column(String)

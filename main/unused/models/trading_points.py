
from main import db
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class TradingPoints(db.Model):

    __tablename__ = "trading_points"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True)  # autoincrement auto True

    name: Mapped[str] = mapped_column(String, nullable=False)

    address: Mapped[str] = mapped_column(String, nullable=False)

    contact_info: Mapped[str] = mapped_column(String)

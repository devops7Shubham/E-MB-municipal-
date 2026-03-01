from datetime import datetime

from sqlalchemy import Column, Integer, String
from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contractor = Column(String)
    agreement_number = Column(String)
    status = Column(String, default="draft")
    file_path = Column(String, nullable=True)
    review_status = Column(String, default="pending")  # pending, approved, rejected
    remarks = relationship("Remark", back_populates="Work",cascade="all, delete-orphan")
class Remark(Base):
    __tablename__ = "remarks"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer,ForeignKey("works.id"),nullable=False)
    remark = Column(String,nullable=False)
    role = Column(String,nullable=False)
    created_at = Column(String, default=datetime.utcnow().isoformat())
    Work = relationship("Work", back_populates="remarks")

from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
# Base Schema
class WorkBase(BaseModel):
    name: str
    contractor: str
    agreement_number: str

# Schema for creating a work (if needed later)
class WorkCreate(WorkBase):
    pass

# Schema for List View (id, name, status)
class WorkSummary(WorkBase):
    id: int
    status: str

    class Config:
        from_attributes = True

# Schema for Detail View (All fields)
class WorkDetail(WorkBase):
    id: int
    status: str
    file_path: Optional[str] = None

    class Config:
        from_attributes = True

#--- Existing Schemas (DO NOT CHANGE) ---
class WorkBase(BaseModel):
    name: str
    contractor: str
    agreement_number: str

class WorkSummary(WorkBase):
    id: int
    status: str
    class Config:
        from_attributes = True

class WorkDetail(WorkBase):
    id: int
    status: str
    file_path: Optional[str] = None
    class Config:
        from_attributes = True

# --- New Review Schemas ---

class RemarkCreate(BaseModel):
    remark: str
    # Role is taken from Header, not body, to prevent spoofing in this demo

class RemarkResponse(BaseModel):
    id: int
    role: str
    remark: str
    created_at: datetime

    class Config:
        from_attributes = True

class WorkReviewDetail(WorkDetail):
    """Extends WorkDetail with review specific fields for DE/EE/CE"""
    review_status: str
    remarks: List[RemarkResponse] = []

class ReviewStatusUpdate(BaseModel):
    review_status: str
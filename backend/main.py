import os
import shutil
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File,Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, get_db, Base
from models import Work
from schemas import WorkSummary, WorkDetail
from sqlalchemy import desc
from schemas import WorkSummary, WorkDetail, RemarkCreate, RemarkResponse, WorkReviewDetail, ReviewStatusUpdate
from models import Work, Remark
from datetime import datetime
# Create DB Tables
Base.metadata.create_all(bind=engine)

# Initialize App
app = FastAPI(title="e-MB System Demo")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for demo purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# --- Endpoints ---

@app.get("/works", response_model=List[WorkSummary])
def get_works_list(db: Session = Depends(get_db)):
    """List all works (summary view)."""
    works = db.query(Work).all()
    return works

@app.get("/works/{work_id}", response_model=WorkDetail)
def get_work_detail(work_id: int, db: Session = Depends(get_db)):
    """Get full metadata for a specific work."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    return work

@app.get("/works/{work_id}/file")
def download_work_file(work_id: int, db: Session = Depends(get_db)):
    """Download the Excel file associated with the work."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    if not work.file_path or not os.path.exists(work.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=work.file_path, 
        filename=os.path.basename(work.file_path),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@app.put("/works/{work_id}/file")
def upload_work_file(
    work_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """Upload an Excel file for the work."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    # Validate file extension
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are allowed")

    # Define storage path
    file_name = f"work_{work_id}.xlsx"
    file_path = UPLOAD_DIR / file_name

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update DB
        work.file_path = str(file_path)
        db.commit()
        db.refresh(work)
        
        return {"message": "File uploaded successfully", "file_path": str(file_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

@app.post("/works/{work_id}/submit", response_model=WorkDetail)
def submit_work(work_id: int, db: Session = Depends(get_db)):
    """Change work status to 'submitted'."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")

    work.status = "submitted"
    db.commit()
    db.refresh(work)
    return work
#-- New Dependencies ---

def get_user_role(request: Request):
    """Extracts role from Header X-User-Role. Defaults to JE if missing."""
    role = request.headers.get("X-User-Role", "JE")
    if role not in ["JE", "DE", "EE", "CE"]:
        raise HTTPException(status_code=400, detail="Invalid Role. Use JE, DE, EE, or CE")
    return role

# --- New Review Endpoints ---

@app.get("/review/works", response_model=List[WorkSummary])
def get_review_works_list(
    role: str = Depends(get_user_role),
    review_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List works for review (DE/EE/CE).
    Only shows works where status='submitted'.
    """
    if role == "JE":
        raise HTTPException(status_code=403, detail="JE cannot access review dashboard")
        
    query = db.query(Work).filter(Work.status == "submitted")
    
    if review_status:
        if review_status not in ["pending", "under_review", "approved", "rejected"]:
            raise HTTPException(status_code=400, detail="Invalid review_status filter")
        query = query.filter(Work.review_status == review_status)
        
    return query.all()

@app.get("/review/works/{work_id}", response_model=WorkReviewDetail)
def get_work_review_detail(
    work_id: int, 
    role: str = Depends(get_user_role),
    db: Session = Depends(get_db)
):
    """Get work details with remarks and review status."""
    if role == "JE":
        raise HTTPException(status_code=403, detail="JE cannot access review details")

    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    return work

@app.post("/review/works/{work_id}/remarks", response_model=RemarkResponse)
def add_remark(
    work_id: int,
    remark_data: RemarkCreate,
    role: str = Depends(get_user_role),
    db: Session = Depends(get_db)
):
    """Add a remark to a work."""
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    new_remark = Remark(
        work_id=work_id,
        role=role,
        remark=remark_data.remark,
        created_at=datetime.utcnow()
    )
    db.add(new_remark)
    
    # If adding a remark, move status to under_review if it was pending
    if work.review_status == "pending":
        work.review_status = "under_review"
        
    db.commit()
    db.refresh(new_remark)
    return new_remark

@app.post("/review/works/{work_id}/status", response_model=WorkReviewDetail)
def update_review_status(
    work_id: int,
    status_data: ReviewStatusUpdate,
    role: str = Depends(get_user_role),
    db: Session = Depends(get_db)
):
    """Update the review status (approved/rejected/etc)."""
    if role == "JE":
        raise HTTPException(status_code=403, detail="JE cannot update review status")

    valid_statuses = ["pending", "under_review", "approved", "rejected"]
    if status_data.review_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from {valid_statuses}")

    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    work.review_status = status_data.review_status
    db.commit()
    db.refresh(work)
    return work
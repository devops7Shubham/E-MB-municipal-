# import os
# from pathlib import Path
# from sqlalchemy.orm import Session
# from database import SessionLocal, engine, Base
# from models import Work
# from openpyxl import Workbook

# # Create tables
# Base.metadata.create_all(bind=engine)

# def create_dummy_excel(path: str):
#     """Creates a blank Excel file with a header."""
#     wb = Workbook()
#     ws = wb.active
#     ws.title = "Measurement Book"
#     ws.append(["Item No", "Description", "Quantity", "Unit", "Rate", "Amount"])
#     wb.save(path)
#     print(f"Created template: {path}")

# def seed_database():
#     db = SessionLocal()
#     try:
#         # Check if already seeded
#         if db.query(Work).count() > 0:
#             print("Database already seeded.")
#             return

#         # Ensure upload dir exists
#         upload_dir = Path(__file__).parent / "uploads"
#         upload_dir.mkdir(exist_ok=True)

#         dummy_data = [
#             {
#                 "name": "Road Construction Phase 1",
#                 "contractor": "BuildCorp Ltd",
#                 "agreement_number": "AGR-2023-001",
#                 "id": 1
#             },
#             {
#                 "name": "Bridge Reinforcement",
#                 "contractor": "InfraFix Inc",
#                 "agreement_number": "AGR-2023-002",
#                 "id": 2
#             },
#             {
#                 "name": "Drainage System Upgrade",
#                 "contractor": "WaterWorks Co",
#                 "agreement_number": "AGR-2023-003",
#                 "id": 3
#             }
#         ]

#         for item in dummy_data:
#             # Create DB Record
#             new_work = Work(
#                 id=item["id"],
#                 name=item["name"],
#                 contractor=item["contractor"],
#                 agreement_number=item["agreement_number"],
#                 status="draft"
#             )
#             db.add(new_work)
            
#             # Create Dummy File
#             file_path = upload_dir / f"work_{item['id']}.xlsx"
#             create_dummy_excel(str(file_path))
#             new_work.file_path = str(file_path)

#         db.commit()
#         print("Database seeded successfully with 3 works and template files.")
        
#     finally:
#         db.close()

# if __name__ == "__main__":
#     seed_database()
import os
from pathlib import Path
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Work, Remark
from openpyxl import Workbook
from datetime import datetime, timedelta

# Create tables (Drops existing to ensure schema sync for demo)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def create_dummy_excel(path: str):
    wb = Workbook()
    ws = wb.active
    ws.title = "Measurement Book"
    ws.append(["Item No", "Description", "Quantity", "Unit", "Rate", "Amount"])
    wb.save(path)

def seed_database():
    db = SessionLocal()
    try:
        upload_dir = Path(__file__).parent / "uploads"
        upload_dir.mkdir(exist_ok=True)

        # 1. Draft Work (JE is working on it)
        work1 = Work(
            id=1,
            name="Cement Concrete Road from Ward 1 to Ward 2",
            contractor="Municipal Works Dept",
            agreement_number="MCD-2023-001",
            status="draft",
            review_status="pending"
        )
        db.add(work1)
        create_dummy_excel(str(upload_dir / "work_1.xlsx"))
        work1.file_path = str(upload_dir / "work_1.xlsx")

        # 2. Submitted + Pending (Waiting for DE)
        work2 = Work(
            id=2,
            name="Drainage Improvement in Ward 5",
            contractor="WaterWorks Co",
            agreement_number="MCD-2023-002",
            status="submitted",
            review_status="pending"
        )
        db.add(work2)
        create_dummy_excel(str(upload_dir / "work_2.xlsx"))
        work2.file_path = str(upload_dir / "work_2.xlsx")

        # 3. Submitted + Under Review + DE Remark
        work3 = Work(
            id=3,
            name="Street Light Installation Phase 2",
            contractor="BrightLights Ltd",
            agreement_number="MCD-2023-003",
            status="submitted",
            review_status="under_review"
        )
        db.add(work3)
        create_dummy_excel(str(upload_dir / "work_3.xlsx"))
        work3.file_path = str(upload_dir / "work_3.xlsx")
        
        remark3 = Remark(
            work_id=3,
            role="DE",
            remark="Please verify the quantity of poles in Item No 4.",
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.add(remark3)

        # 4. Submitted + Approved + DE & EE Remarks
        work4 = Work(
            id=4,
            name="Park Renovation Central Zone",
            contractor="GreenSpace Inc",
            agreement_number="MCD-2023-004",
            status="submitted",
            review_status="approved"
        )
        db.add(work4)
        create_dummy_excel(str(upload_dir / "work_4.xlsx"))
        work4.file_path = str(upload_dir / "work_4.xlsx")

        remark4_de = Remark(
            work_id=4,
            role="DE",
            remark="Measurements verified on site.",
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        remark4_ee = Remark(
            work_id=4,
            role="EE",
            remark="Approved for payment processing.",
            created_at=datetime.utcnow() - timedelta(days=4)
        )
        db.add(remark4_de)
        db.add(remark4_ee)

        db.commit()
        print("Database seeded successfully with 4 works and review data.")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
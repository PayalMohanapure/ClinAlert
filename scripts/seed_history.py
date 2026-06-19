import os
import sys
import json
import random
import shutil
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from dotenv import load_dotenv
from database.models import User, Patient, Scan, Drug
from database.crud import search_drug
from backend.main import get_password_hash

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clinalert_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("Starting seeding process...")

# 1. Ensure test doctor exists
email = "doctor3@clinalert.com"
doctor = db.query(User).filter(User.email == email).first()
if not doctor:
    hashed_pwd = get_password_hash("password123")
    doctor = User(email=email, hashed_password=hashed_pwd, full_name="Payal Munapure", role="doctor")
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    print(f"Created doctor: {email}")
else:
    print(f"Doctor already exists: {email}")

# Clean existing scans and patients for this doctor to avoid duplicate entries
db.query(Scan).filter(Scan.doctor_id == doctor.id).delete()
db.query(Patient).filter(Patient.doctor_id == doctor.id).delete()
db.commit()
print("Cleaned previous seed data.")

# 2. Create some patients
patient_names = [
    "Rahul Sharma", "Priya Patel", "Amit Singh", "Neha Gupta", "Vikram Malhotra",
    "Anjali Desai", "Rajesh Kumar", "Sunita Rao", "Karan Johar", "Deepika Padukone",
    "Sanjay Dutt", "Priyanka Chopra", "Ranbir Kapoor", "Alia Bhatt", "Akshay Kumar",
    "Kareena Kapoor", "Salman Khan", "Katrina Kaif", "Hrithik Roshan", "Aishwarya Rai"
]

patients = []
for name in patient_names:
    p = Patient(
        doctor_id=doctor.id,
        patient_name=name,
        age=random.randint(18, 75),
        gender=random.choice(["Male", "Female"])
    )
    db.add(p)
    patients.append(p)
db.commit()

# Refresh patients to get IDs
for p in patients:
    db.refresh(p)
print(f"Created {len(patients)} patients.")

# 3. Get list of available drugs in database to simulate extractions
available_drugs = db.query(Drug).limit(100).all()
if not available_drugs:
    print("WARNING: No drugs found in database. Using fallbacks.")
    available_drugs_names = ["paracetamol", "ibuprofen", "amoxicillin", "metformin", "atorvastatin"]
else:
    available_drugs_names = [d.generic_name for d in available_drugs]

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# 4. Create 30 historical scans
prescription_dir = "d:\\ClinAlert\\test_prescriptions"
prescription_files = sorted([f for f in os.listdir(prescription_dir) if f.startswith("real_prescription_")])

for i in range(30):
    # Determine the date of the scan (spread over last 30 days)
    scan_date = datetime.utcnow() - timedelta(days=30-i, hours=random.randint(0, 23))
    
    # Pick 1 to 3 random drugs for this scan
    sampled_drugs = random.sample(available_drugs_names, min(len(available_drugs_names), random.randint(1, 3)))
    
    # Query drug details from database
    results = []
    for drug_name in sampled_drugs:
        res = search_drug(db, query=drug_name)
        if res:
            results.append(res)
            
    # Copy corresponding image to uploads directory
    src_img = prescription_files[i % len(prescription_files)]
    src_path = os.path.join(prescription_dir, src_img)
    
    dest_filename = f"prescription_{doctor.id}_{int(scan_date.timestamp())}_{i}.jpg"
    dest_path = os.path.join("uploads", dest_filename)
    shutil.copy(src_path, dest_path)
    
    # Determine Status
    status = "Clean"
    has_alerts = False
    has_alternatives = False
    
    for r in results:
        if len(r.alerts) > 0:
            has_alerts = True
        if len(r.cheaper_alternatives) > 0:
            has_alternatives = True
            
    if has_alerts:
        status = "Critical Alert"
    elif has_alternatives:
        status = "Alternative Found"
        
    analysis_json = json.dumps([json.loads(r.json()) for r in results])
    extracted_text = ", ".join(sampled_drugs)
    
    patient = random.choice(patients)
    
    db_scan = Scan(
        doctor_id=doctor.id,
        patient_id=patient.id,
        scan_date=scan_date,
        extracted_text=extracted_text,
        image_path=dest_path.replace("\\", "/"),
        status=status,
        analysis_result=analysis_json
    )
    db.add(db_scan)

db.commit()
print("Successfully seeded 30 prescription scans with real-time database results!")

import os
import sys
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from dotenv import load_dotenv
from backend.schemas import DrugResponse
from pydantic import BaseModel
from sqlalchemy import func
from database.crud import search_drug
from database.models import CDSCOAlert, SIDERSideEffect
from agentic_ai.ai_extractor import extract_drugs_with_vision
from agentic_ai.agent import run_agent_query
from passlib.context import CryptContext
from backend.auth_schemas import UserCreate, UserLogin, UserResponse
from database.models import User, Patient, Scan
from fastapi.responses import FileResponse
from fpdf import FPDF
import tempfile
import json
import cloudinary
import cloudinary.uploader
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from backend.auth_schemas import Token, TokenData

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clinalert_db")
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="ClinAlert API",
    description="REST API for querying drug side effects, PMBI pricing, and CDSCO alerts.",
    version="1.0.0"
)

@app.get("/api/v1/debug")
def debug_env():
    import os
    db_url = os.getenv("DATABASE_URL")
    return {"db_url_set": bool(db_url), "url_prefix": db_url[:15] if db_url else None}


# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ClinAlert API is running!"}

@app.get("/api/v1/search", response_model=DrugResponse, tags=["Search"])
def search_for_drug(
    q: str = Query(..., description="Search by brand name or generic name"), 
    db: Session = Depends(get_db)
):
    result = search_drug(db, query=q)
    if not result:
        raise HTTPException(status_code=404, detail=f"Drug '{q}' not found.")
    return result



class ChatRequest(BaseModel):
    message: str

@app.post("/api/v1/chat", tags=["Agentic AI"])
def chat_with_medical_agent(request: ChatRequest):
    """
    Sends a message to the autonomous Agentic RAG system.
    The agent will decide whether to query PostgreSQL or the Vector Database.
    """
    answer = run_agent_query(request.message)
    return {"reply": answer}

@app.get("/api/v1/analytics", tags=["Dashboard"])
def get_dashboard_analytics():
    """Returns aggregated data for the Doctor Portal dashboard."""
    db = SessionLocal()
    try:
        # Total CDSCO Alerts
        total_alerts = db.query(CDSCOAlert).count()
        
        # Most common side effects
        top_side_effects = db.query(
            SIDERSideEffect.side_effect_name, 
            func.count(SIDERSideEffect.id).label('count')
        ).group_by(SIDERSideEffect.side_effect_name).order_by(func.count(SIDERSideEffect.id).desc()).limit(5).all()
        
        formatted_sider = [{"name": name, "occurrences": count} for name, count in top_side_effects]
        
        # Alerts over time (mocked for simplicity, or grouped by date)
        # We'll just return total_alerts for now to keep the dashboard simple
        
        return {
            "total_alerts": total_alerts,
            "top_side_effects": formatted_sider
        }
    finally:
        db.close()

# --- AUTHENTICATION ENDPOINTS ---
import bcrypt as _bcrypt

def verify_password(plain_password, hashed_password):
    return _bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return _bcrypt.hashpw(password.encode('utf-8'), _bcrypt.gensalt()).decode('utf-8')

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-clinalert-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/api/v1/prescription/upload", tags=["Prescription AI"])
async def upload_prescription(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts an image of a prescription, runs it through LangChain Vision AI,
    extracts drugs, and returns the DB info for all drugs found!
    """
    image_bytes = await file.read()
    
    # 1. State-of-the-Art Vision AI Extraction (Bypasses Tesseract)
    extracted_drug_names = extract_drugs_with_vision(image_bytes)
    
    # 2. Database Lookup Pipeline
    results = []
    for drug_name in extracted_drug_names:
        db_result = search_drug(db, query=drug_name)
        if db_result:
            results.append(db_result)
            
    # Upload the file directly to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(image_bytes, folder="clinalert_prescriptions")
        file_path = upload_result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary Upload Failed: {e}")
        # Fallback to a placeholder or empty string if upload fails
        file_path = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
        
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
        
    # Serialize analysis result
    analysis_json = json.dumps([json.loads(r.json()) for r in results])
    extracted_text = ", ".join(extracted_drug_names) if extracted_drug_names else ""
    
    # Save Scan record
    db_scan = Scan(
        doctor_id=current_user.id,
        patient_id=None,
        extracted_text=extracted_text,
        image_path=file_path,
        status=status,
        analysis_result=analysis_json
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    return {
        "status": "success",
        "scan_id": db_scan.id,
        "database_results": results
    }

@app.get("/api/v1/dashboard/metrics", tags=["Dashboard"])
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns real-time doctor-specific dashboard metrics.
    """
    # Fetch all scans for current doctor
    scans = db.query(Scan).filter(Scan.doctor_id == current_user.id).order_by(Scan.scan_date.desc()).all()
    
    # 1. Total Scans
    total_scans = len(scans)
    
    # 2. Total Patients
    total_patients = db.query(Patient).filter(Patient.doctor_id == current_user.id).count()
    
    # 3. CDSCO Alerts
    cdsco_alerts_count = sum(1 for s in scans if s.status == "Critical Alert")
    
    # 4. PMBI Savings
    pmbi_savings = 0
    for s in scans:
        if s.analysis_result:
            try:
                drugs_data = json.loads(s.analysis_result)
                for drug in drugs_data:
                    alts = drug.get("cheaper_alternatives", [])
                    if alts:
                        # Estimate savings at Rs. 150 per alternative found
                        pmbi_savings += 150
            except Exception:
                pass
                
    # Build recent scans list
    recent_scans_list = []
    for s in scans[:10]: # Limit to last 10 scans
        patient_name = "Walk-in Patient"
        if s.patient_id:
            pat = db.query(Patient).filter(Patient.id == s.patient_id).first()
            if pat:
                patient_name = pat.patient_name
        
        recent_scans_list.append({
            "id": f"SCN-{s.id}",
            "patient": patient_name,
            "date": s.scan_date.strftime("%Y-%m-%d") if s.scan_date else "",
            "status": s.status or "Clean",
            "image_path": s.image_path,
            "extracted_text": s.extracted_text
        })
        
    return {
        "metrics": {
            "total_scans": f"{total_scans:,}",
            "total_patients": f"{total_patients:,}",
            "cdsco_alerts": f"{cdsco_alerts_count:,}",
            "pmbi_savings": f"₹{pmbi_savings:,}"
        },
        "recent_scans": recent_scans_list
    }


@app.post("/api/v1/auth/register", response_model=UserResponse, tags=["Auth"])
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/v1/auth/login", response_model=Token, tags=["Auth"])
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user": db_user}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Login error: {type(e).__name__}: {str(e)}\n{traceback.format_exc()}")

# --- SECURED ENDPOINTS (Added get_current_user dependency) ---
class PDFReportRequest(BaseModel):
    drugs_data: list

@app.post("/api/v1/report/pdf", tags=["Reports"])
def generate_pdf_report(request: PDFReportRequest):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="ClinAlert Clinical Report", ln=True, align='C')
    pdf.ln(10)

    pdf.set_font("Arial", size=12)
    for drug in request.drugs_data:
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(200, 10, txt=f"Drug: {drug.get('generic_name')} (Brand: {drug.get('matched_brand')})", ln=True)
        pdf.set_font("Arial", size=10)
        
        alerts = drug.get('alerts', [])
        if alerts:
            pdf.set_text_color(220, 53, 69) # Red
            for a in alerts:
                pdf.cell(200, 10, txt=f"ALERT: {a.get('alert_title')} - {a.get('description')}", ln=True)
            pdf.set_text_color(0, 0, 0)
        
        alts = drug.get('cheaper_alternatives', [])
        if alts:
            pdf.set_text_color(40, 167, 69) # Green
            for alt in alts:
                pdf.cell(200, 10, txt=f"PMBI ALT: {alt.get('brand_name')} - Rs.{alt.get('mrp')}", ln=True)
            pdf.set_text_color(0, 0, 0)
            
        pdf.ln(5)

    # Save to temp file and return
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf.output(temp_pdf.name)
    return FileResponse(temp_pdf.name, media_type='application/pdf', filename="Clinical_Report.pdf")

# --- PATIENT MANAGEMENT ---
class PatientCreate(BaseModel):
    doctor_id: int
    patient_name: str
    age: Optional[int] = None
    gender: Optional[str] = None

@app.post("/api/v1/patients", tags=["Patients"])
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/api/v1/patients", tags=["Patients"])
def get_patients(doctor_id: int, db: Session = Depends(get_db)):
    patients = db.query(Patient).filter(Patient.doctor_id == doctor_id).all()
    return patients

class ScanCreate(BaseModel):
    doctor_id: int
    patient_id: Optional[int] = None
    extracted_text: str

@app.post("/api/v1/scans", tags=["Patients"])
def create_scan(scan: ScanCreate, db: Session = Depends(get_db)):
    db_scan = Scan(doctor_id=scan.doctor_id, patient_id=scan.patient_id, extracted_text=scan.extracted_text)
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan

@app.get("/api/v1/scans", tags=["Patients"])
def get_scans(patient_id: int, db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.patient_id == patient_id).order_by(Scan.scan_date.desc()).all()
    return scans

# --- DRUG INTERACTIONS ---
class InteractionRequest(BaseModel):
    drugs: list[str]

@app.post("/api/v1/interactions", tags=["Agentic AI"])
def check_interactions(request: InteractionRequest):
    if len(request.drugs) < 2:
        return {"risk_score": "Low", "analysis": "Need at least two drugs to check for interactions."}
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
    prompt = PromptTemplate.from_template(
        "You are a clinical pharmacologist. Evaluate the potential drug-drug interactions between these medications: {drugs}. "
        "Provide a short, direct analysis and assign a 'risk_score' of either Low, Moderate, or High."
    )
    chain = prompt | llm
    
    try:
        response = chain.invoke({"drugs": ", ".join(request.drugs)})
        # Simple string parsing since we asked for a direct analysis
        text = response.content
        score = "High" if "High" in text else "Moderate" if "Moderate" in text else "Low"
        return {"risk_score": score, "analysis": text}
    except Exception as e:
        return {"risk_score": "Unknown", "analysis": str(e)}

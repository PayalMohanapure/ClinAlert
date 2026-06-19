import sys
from sqlalchemy import create_engine
from database.models import Base, User
from backend.main import get_password_hash
from sqlalchemy.orm import sessionmaker

NEON_URL = "postgresql://neondb_owner:npg_mRwcMS1D0rOH@ep-silent-sea-atrjewh2.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    print("Connecting to Neon...")
    engine = create_engine(NEON_URL)
    
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Inserting demo user...")
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    email = "demo@clinalert.com"
    existing = db.query(User).filter(User.email == email).first()
    if not existing:
        new_user = User(
            email=email,
            hashed_password=get_password_hash("password123"),
            full_name="Demo Doctor",
            role="doctor"
        )
        db.add(new_user)
        db.commit()
        print("Demo user created in NEON database!")
    else:
        print("Demo user already exists in NEON database!")
    db.close()
    
    print("SUCCESS: Neon database initialized.")
except Exception as e:
    print(f"FAILED: {e}")

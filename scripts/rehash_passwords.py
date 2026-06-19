import sys, os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv()

import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import User

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

# Re-hash ALL user passwords with direct bcrypt (compatible with any version)
accounts = [
    ("demo@clinalert.com", "password123"),
    ("dr.sharma@clinalert.com", "pass1234"),
    ("dr.patel@clinalert.com", "pass1234"),
    ("dr.kumar@clinalert.com", "pass1234"),
    ("dr.singh@clinalert.com", "pass1234"),
    ("dr.gupta@clinalert.com", "pass1234"),
    ("dr.khan@clinalert.com", "pass1234"),
    ("dr.reddy@clinalert.com", "pass1234"),
    ("dr.joshi@clinalert.com", "pass1234"),
    ("dr.verma@clinalert.com", "pass1234"),
]

for email, password in accounts:
    user = db.query(User).filter(User.email == email).first()
    if user:
        new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.hashed_password = new_hash
        db.commit()
        print(f"  [OK] Re-hashed: {email}")
    else:
        print(f"  [SKIP] Not found: {email}")

db.close()
print("\nAll passwords re-hashed with direct bcrypt!")

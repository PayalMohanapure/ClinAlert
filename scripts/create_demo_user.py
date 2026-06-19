import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
load_dotenv()

from database.models import User
from backend.main import SessionLocal, get_password_hash

def create_demo_user():
    db = SessionLocal()
    try:
        email = "demo@clinalert.com"
        password = "password123"
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("Demo user already exists!")
            return
            
        hashed = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed,
            full_name="Demo Doctor",
            role="doctor"
        )
        db.add(new_user)
        db.commit()
        print(f"SUCCESS! Created user: {email} with password: {password}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user()

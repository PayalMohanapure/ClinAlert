import sys, os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Scan

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("Deleting fake scans from the database...")

# The fake scans we generated earlier did not have actual uploaded images
fake_scans = db.query(Scan).filter(Scan.image_path == None).all()
count = len(fake_scans)

for scan in fake_scans:
    db.delete(scan)

db.commit()
db.close()

print(f"Successfully deleted {count} fake scans. The database is clean.")

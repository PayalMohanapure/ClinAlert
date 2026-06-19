import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clinalert_db"

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE scans ADD COLUMN IF NOT EXISTS image_path VARCHAR;"))
    conn.execute(text("ALTER TABLE scans ADD COLUMN IF NOT EXISTS status VARCHAR;"))
    conn.execute(text("ALTER TABLE scans ADD COLUMN IF NOT EXISTS analysis_result TEXT;"))
    conn.commit()

print("Successfully altered 'scans' table without dropping data!")

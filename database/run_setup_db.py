import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clinalert_db"

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with open("setup_db.sql", "r") as f:
    sql = f.read()

with engine.connect() as conn:
    conn.execute(text(sql))
    conn.commit()

print("✅ Database tables successfully created from setup_db.sql!")

import os
from sqlalchemy import create_engine
from database.models import Base
from dotenv import load_dotenv

load_dotenv()

# Assuming standard local postgres
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clinalert")

engine = create_engine(DATABASE_URL)

print("Creating new tables...")
Base.metadata.create_all(bind=engine)
print("Database schema successfully updated!")

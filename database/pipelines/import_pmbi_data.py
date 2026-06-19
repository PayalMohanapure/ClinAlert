import os
import pandas as pd
import sys
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Setup database connection (Allows us to talk to PostgreSQL)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.models import Drug, PMBIDrug
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clinalert_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

CSV_FILE_PATH = "d:\\ClinAlert\\data\\pmbi\\pmbi_drugs.csv"

def import_pmbi_data():
    print("Reading PMBI CSV dataset...")
    try:
        # Extract Phase
        df = pd.read_csv(CSV_FILE_PATH, dtype=str)
    except Exception as e:
        print(f"ERROR: Failed to read CSV. Check if the file is a valid CSV! Error: {e}")
        return

    db = SessionLocal()
    try:
        # 2. Caching: We load existing drugs to find the correct drug_id (Foreign Key)
        print("Caching existing master drugs...")
        existing_drugs = db.query(Drug).all()
        drug_cache = {d.generic_name.lower(): d.id for d in existing_drugs}
        
        drugs_to_insert = {}
        for index, row in df.iterrows():
            generic_name = str(row.get('Generic Name', '')).strip().lower()
            if not generic_name or generic_name == 'nan':
                continue
            if generic_name not in drug_cache and generic_name not in drugs_to_insert:
                drugs_to_insert[generic_name] = Drug(generic_name=generic_name)

        if drugs_to_insert:
            print(f"Inserting {len(drugs_to_insert)} new generic drugs into 'drugs' table...")
            db.bulk_save_objects(list(drugs_to_insert.values()))
            db.commit()
            new_drugs = db.query(Drug).all()
            drug_cache = {d.generic_name.lower(): d.id for d in new_drugs}
            
        pmbi_records = []
        
        print("Transforming rows...")
        seen_records = set()

        for index, row in df.iterrows():
            # Transform Phase: Clean strings and numbers
            # NOTE: Update these column names if your CSV header is different!
            drug_code = str(row.get('Drug Code', '')).strip()
            generic_name = str(row.get('Generic Name', '')).strip().lower()
            unit_size = str(row.get('Unit Size', '')).strip()
            mrp_str = str(row.get('MRP', '0')).strip()
            
            if not generic_name or generic_name == 'nan':
                continue
                
            try:
                mrp_value = Decimal(mrp_str.replace('Rs.', '').strip())
            except:
                mrp_value = Decimal("0.00")

            # 3. Foreign Key Relationship Handling
            drug_id = drug_cache.get(generic_name)
            
            # 4. Prepare the final row for insertion
            brand_name = f"Janaushadhi {generic_name}"
            
            # Check for duplicates!
            record_key = (brand_name, unit_size)
            if record_key in seen_records:
                continue # Skip this row, it's a duplicate!
            
            seen_records.add(record_key)
            
            pmbi_records.append(
                PMBIDrug(
                    drug_id=drug_id,
                    drug_code=drug_code,
                    brand_name=brand_name,
                    strength=unit_size,
                    mrp=mrp_value,
                    source_name="PMBI / Janaushadhi"
                )
            )

        # 5. Load Phase: Bulk insert into Database
        print(f"Inserting {len(pmbi_records)} PMBI pricing records...")
        db.bulk_save_objects(pmbi_records)
        db.commit()
        print("SUCCESS: Populated pmbi_drugs table!")

    except Exception as e:
        db.rollback() # If anything fails, revert changes so we don't have corrupted data
        print(f"ERROR during import: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_pmbi_data()

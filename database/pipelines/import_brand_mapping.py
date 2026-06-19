import os
import re
import pandas as pd
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to python path to import models and database config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from database.models import Base
from database.models import Drug, BrandMapping

# Connect to database using env DATABASE_URL
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clinalert_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

CSV_FILE_PATH = "d:\\ClinAlert\\data\\indian_medicine_data.csv"

def clean_generic_name(comp):
    """
    Cleans composition text by removing strengths, units, and standardizing.
    Example: 'Amoxycillin  (500mg) ' -> 'amoxycillin'
    """
    if pd.isna(comp) or not isinstance(comp, str):
        return None
    
    # Remove everything inside parentheses (e.g. "(500mg)")
    comp = re.sub(r'\(.*?\)', '', comp)
    
    # Strip spaces and lowercase
    comp = comp.strip().lower()
    
    # Clean common remnants like multiple spaces or trailing punctuation
    comp = re.sub(r'\s+', ' ', comp)
    
    return comp if comp else None

def import_brand_mappings():
    if not os.path.exists(CSV_FILE_PATH):
        print(f"ERROR: CSV file not found at {CSV_FILE_PATH}")
        return

    print("Reading CSV dataset...")
    # Read only the columns we need to save memory
    df = pd.read_csv(CSV_FILE_PATH, usecols=["name", "short_composition1", "short_composition2"])
    print(f"Loaded {len(df)} rows of data.")

    db = SessionLocal()
    try:
        # 1. Fetch all existing drugs to build an in-memory cache to avoid duplicate queries
        print("Caching existing drugs from database...")
        existing_drugs = db.query(Drug).all()
        drug_cache = {d.generic_name: d.id for d in existing_drugs}
        print(f"Cached {len(drug_cache)} drugs.")

        # Cache existing brand mappings to avoid duplicates
        print("Caching existing brand mappings...")
        existing_mappings = db.query(BrandMapping.brand_name, BrandMapping.drug_id).all()
        mapping_cache = set(existing_mappings)
        print(f"Cached {len(mapping_cache)} mappings.")

        drugs_to_insert = {} # generic_name: Drug object
        mappings_to_insert = []
        
        print("Processing rows (this may take a minute)...")
        for index, row in df.iterrows():
            brand_name = row['name']
            if pd.isna(brand_name) or not isinstance(brand_name, str):
                continue
            
            brand_name = brand_name.strip()

            # Process compositions
            compositions = []
            c1 = clean_generic_name(row['short_composition1'])
            c2 = clean_generic_name(row['short_composition2'])
            if c1: compositions.append(c1)
            if c2: compositions.append(c2)

            for generic in compositions:
                # 1. If drug not in database/cache, mark it for insertion
                if generic not in drug_cache and generic not in drugs_to_insert:
                    drugs_to_insert[generic] = Drug(generic_name=generic)
                
            # Print status every 50,000 rows
            if index > 0 and index % 50000 == 0:
                print(f"Processed {index} rows...")

        # 2. Bulk insert new master drugs
        if drugs_to_insert:
            print(f"Inserting {len(drugs_to_insert)} new generic drugs into 'drugs' table...")
            db.bulk_save_objects(list(drugs_to_insert.values()))
            db.commit()
            
            # Re-fetch new drugs to update the cache with their database IDs
            new_drugs = db.query(Drug).all()
            drug_cache = {d.generic_name: d.id for d in new_drugs}
            print("Generic drugs successfully cached.")

        # 3. Create mapping records
        print("Building brand mapping records...")
        for index, row in df.iterrows():
            brand_name = row['name']
            if pd.isna(brand_name) or not isinstance(brand_name, str):
                continue
            brand_name = brand_name.strip()

            compositions = []
            c1 = clean_generic_name(row['short_composition1'])
            c2 = clean_generic_name(row['short_composition2'])
            if c1: compositions.append(c1)
            if c2: compositions.append(c2)

            for generic in compositions:
                drug_id = drug_cache.get(generic)
                if drug_id:
                    # Check duplicate in cache
                    if (brand_name, drug_id) not in mapping_cache:
                        mappings_to_insert.append({
                            "brand_name": brand_name,
                            "drug_id": drug_id,
                            "source_name": "Tata 1mg Dataset"
                        })
                        mapping_cache.add((brand_name, drug_id)) # avoid duplicates in current batch

        # 4. Bulk insert brand mappings in chunks to avoid memory overflow
        if mappings_to_insert:
            chunk_size = 10000
            total_mappings = len(mappings_to_insert)
            print(f"Inserting {total_mappings} brand mappings into 'brand_mappings' table in chunks of {chunk_size}...")
            
            for i in range(0, total_mappings, chunk_size):
                chunk = mappings_to_insert[i:i + chunk_size]
                db.bulk_insert_mappings(BrandMapping, chunk)
                db.commit()
                print(f"Inserted mappings {i} to {min(i + chunk_size, total_mappings)}...")

        print("SUCCESS: Loaded brand-to-generic mapping into the database!")

    except Exception as e:
        db.rollback()
        print(f"ERROR importing mappings: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_brand_mappings()

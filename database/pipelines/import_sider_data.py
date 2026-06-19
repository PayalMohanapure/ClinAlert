import os
import pandas as pd
import sys
import urllib.request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Setup database connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.models import Drug, SIDERSideEffect
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clinalert_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SIDER_DIR = "d:\\ClinAlert\\data\\sider"
SE_FILE = os.path.join(SIDER_DIR, "meddra_all_se.tsv")
NAMES_FILE = os.path.join(SIDER_DIR, "drug_names.tsv")

def download_missing_file():
    """Downloads the STITCH ID to English Name translation dictionary"""
    if not os.path.exists(NAMES_FILE):
        print(f"Downloading missing SIDER dictionary: {NAMES_FILE}...")
        url = "http://sideeffects.embl.de/media/download/drug_names.tsv"
        urllib.request.urlretrieve(url, NAMES_FILE)
        print("SUCCESS: Downloaded drug_names.tsv!")

def import_sider_data():
    download_missing_file()

    print("Reading SIDER TSV datasets...")
    # Extract Phase: Notice we use sep='\t' for TSV files!
    df_se = pd.read_csv(SE_FILE, sep='\t', header=None, 
                        names=["stitch_id_flat", "stitch_id_stereo", "umls_id", "meddra_type", "meddra_concept_id", "side_effect_name"])
    
    df_names = pd.read_csv(NAMES_FILE, sep='\t', header=None, names=["stitch_id", "drug_name"])

    # Transform Phase 1: Create a dictionary mapping STITCH ID -> English Drug Name
    print("Building STITCH ID translation dictionary...")
    stitch_to_name = {}
    for index, row in df_names.iterrows():
        stitch_to_name[row['stitch_id']] = str(row['drug_name']).strip().lower()

    db = SessionLocal()
    try:
        # Transform Phase 2: Cache existing master drugs to find drug_id Foreign Keys
        print("Caching existing master drugs...")
        existing_drugs = db.query(Drug).all()
        drug_cache = {d.generic_name.lower(): d.id for d in existing_drugs}
        
        sider_records = []
        seen_records = set() # Prevent duplicate side effects for the same drug
        
        print("Transforming and mapping side effects...")
        
        # We only want Preferred Terms (PT) to avoid junk/duplicate Lower Level Terms (LLT)
        df_se_filtered = df_se[df_se['meddra_type'] == 'PT']

        drugs_to_insert = {}
        for index, row in df_se_filtered.iterrows():
            stitch_id = row['stitch_id_flat']
            generic_name = stitch_to_name.get(stitch_id)
            if not generic_name:
                continue
            if generic_name not in drug_cache and generic_name not in drugs_to_insert:
                drugs_to_insert[generic_name] = Drug(generic_name=generic_name)
        
        if drugs_to_insert:
            print(f"Inserting {len(drugs_to_insert)} new generic drugs into 'drugs' table...")
            db.bulk_save_objects(list(drugs_to_insert.values()))
            db.commit()
            new_drugs = db.query(Drug).all()
            drug_cache = {d.generic_name.lower(): d.id for d in new_drugs}

        for index, row in df_se_filtered.iterrows():
            stitch_id = row['stitch_id_flat']
            side_effect = str(row['side_effect_name']).strip()
            meddra_id = str(row['meddra_concept_id']).strip()

            # 1. Translate STITCH ID to English Generic Name
            generic_name = stitch_to_name.get(stitch_id)
            if not generic_name:
                continue # If we don't know the english name, skip it

            # 2. Look up the Foreign Key (drug_id)
            drug_id = drug_cache.get(generic_name)
            
            # 3. Prevent Duplicates using Sets!
            record_key = (drug_id, side_effect)
            if record_key in seen_records:
                continue
            seen_records.add(record_key)

            # 4. Prepare for insertion
            sider_records.append(
                SIDERSideEffect(
                    drug_id=drug_id,
                    stitch_id=stitch_id,
                    side_effect_name=side_effect,
                    meddra_concept_id=meddra_id,
                    source_name="SIDER"
                )
            )

        # Load Phase: Bulk insert in chunks to manage memory
        print(f"Inserting {len(sider_records)} Side Effect records. This may take a minute...")
        
        chunk_size = 10000
        for i in range(0, len(sider_records), chunk_size):
            chunk = sider_records[i:i + chunk_size]
            db.bulk_save_objects(chunk)
            db.commit()
            print(f"Inserted mappings {i} to {min(i + chunk_size, len(sider_records))}...")

        print("SUCCESS: Populated sider_side_effects table!")

    except Exception as e:
        db.rollback()
        print(f"ERROR during import: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_sider_data()

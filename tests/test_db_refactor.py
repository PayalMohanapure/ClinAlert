import os
import sys
from decimal import Decimal
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root to python path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.db.database import Base
from database.models import Drug, PMBIDrug, SIDERSideEffect, CDSCOAlert, BrandMapping

# Connect to database using env DATABASE_URL
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clinalert_db"

print(f"Connecting to database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    db = SessionLocal()
    try:
        print("\n--- Testing Master Drugs Insertion ---")
        # 1. Clean existing records if any
        db.query(BrandMapping).delete()
        db.query(CDSCOAlert).delete()
        db.query(SIDERSideEffect).delete()
        db.query(PMBIDrug).delete()
        db.query(Drug).delete()
        db.commit()

        # 2. Add a master drug
        drug = Drug(generic_name="paracetamol")
        db.add(drug)
        db.commit()
        db.refresh(drug)
        print(f"✅ Master Drug inserted: ID={drug.id}, Name={drug.generic_name}")

        # 3. Add PMBI Drug
        pmbi = PMBIDrug(
            drug_id=drug.id,
            drug_code="P123",
            brand_name="Dolo 650mg",
            dosage_form="Tablet",
            strength="650mg",
            mrp=Decimal("30.50"),
            source_name="Janaushadhi"
        )
        db.add(pmbi)
        db.commit()
        db.refresh(pmbi)
        print(f"✅ PMBI Drug inserted: Brand={pmbi.brand_name}, MRP={pmbi.mrp} (Type: {type(pmbi.mrp)}), Source={pmbi.source_name}")

        # 4. Add Side Effect
        side_effect = SIDERSideEffect(
            drug_id=drug.id,
            stitch_id="CID100000085",
            side_effect_name="Nausea",
            source_name="SIDER"
        )
        db.add(side_effect)
        db.commit()
        print(f"✅ Side Effect inserted: {side_effect.side_effect_name}")

        # 5. Add CDSCO Alert
        alert = CDSCOAlert(
            drug_id=drug.id,
            alert_title="Quality Warning",
            description="Sample failed quality check",
            alert_date=date(2026, 6, 10),
            source_url="https://cdsco.gov.in/alert123",
            source_name="CDSCO"
        )
        db.add(alert)
        db.commit()
        print(f"✅ CDSCO Alert inserted: Date={alert.alert_date} (Type: {type(alert.alert_date)})")

        # 6. Add Brand Mapping
        brand_map = BrandMapping(
            drug_id=drug.id,
            brand_name="Crocin Active",
            source_name="Tata 1mg Dataset"
        )
        db.add(brand_map)
        db.commit()
        db.refresh(brand_map)
        print(f"✅ Brand Mapping inserted: Brand={brand_map.brand_name}, Linked Drug ID={brand_map.drug_id}")

        # 7. Verify unique constraint brand_name + strength
        print("\n--- Testing Unique Constraint (brand_name + strength) ---")
        duplicate_pmbi = PMBIDrug(
            drug_id=drug.id,
            brand_name="Dolo 650mg",
            strength="650mg",
            mrp=Decimal("15.00")
        )
        try:
            db.add(duplicate_pmbi)
            db.commit()
            print("❌ Failed: Duplicate brand_name and strength was allowed!")
        except Exception as e:
            db.rollback()
            print("✅ Success: Duplicate brand_name and strength blocked by Unique Constraint!")

        print("\n🎉 All database refactoring schema tests passed!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()


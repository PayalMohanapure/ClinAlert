import os
import sys
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. Setup Database Connection
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from database.models import Drug, CDSCOAlert
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/clinalert_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def scrape_cdsco_alerts():
    """
    Extract Phase:
    In production, this uses BeautifulSoup to scrape https://cdsco.gov.in.
    For this MVP, we are injecting mocked JSON payloads representing scraped HTML.
    """
    print("Initiating HTTP requests to CDSCO Portal...")
    return [
        {
            "generic_name": "paracetamol",
            "alert_title": "NSQ (Not of Standard Quality) Alert",
            "description": "Sample failed dissolution test in state lab.",
            "alert_date": date(2026, 5, 10),
            "source_url": "https://cdsco.gov.in/alert/101"
        },
        {
            "generic_name": "pantoprazole",
            "alert_title": "Spurious Drug Warning",
            "description": "Counterfeit batch identified in Delhi region.",
            "alert_date": date(2026, 6, 1),
            "source_url": "https://cdsco.gov.in/alert/102"
        },
        {
            "generic_name": "amoxycillin",
            "alert_title": "Recall Notice",
            "description": "Voluntary recall due to packaging defect.",
            "alert_date": date(2026, 6, 11),
            "source_url": "https://cdsco.gov.in/alert/103"
        }
    ]

def import_cdsco_data():
    db = SessionLocal()
    try:
        # Extract Phase (Web Scraping Execution)
        scraped_data = scrape_cdsco_alerts()

        # Transform Phase: Setup Cache for Foreign Key Resolution
        print("Caching existing master drugs...")
        existing_drugs = db.query(Drug).all()
        drug_cache = {d.generic_name.lower(): d.id for d in existing_drugs}

        alerts_to_insert = []
        
        print("Transforming and sanitizing scraped alerts...")
        for alert in scraped_data:
            generic_name = alert["generic_name"].lower()
            
            # Foreign Key Resolution
            drug_id = drug_cache.get(generic_name)
            if not drug_id:
                new_drug = Drug(generic_name=generic_name)
                db.add(new_drug)
                db.commit()
                db.refresh(new_drug)
                drug_id = new_drug.id
                drug_cache[generic_name] = drug_id
            
            # Prepare ORM Object
            alerts_to_insert.append(
                CDSCOAlert(
                    drug_id=drug_id,
                    alert_title=alert["alert_title"],
                    description=alert["description"],
                    alert_date=alert["alert_date"],
                    source_url=alert["source_url"],
                    source_name="CDSCO Regulatory Board"
                )
            )

        # Load Phase: Database Ingestion
        print(f"Loading {len(alerts_to_insert)} regulatory alerts into the database...")
        db.bulk_save_objects(alerts_to_insert)
        db.commit()
        print("SUCCESS: Populated cdsco_alerts table!")

    except Exception as e:
        db.rollback()
        print(f"ERROR during import: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_cdsco_data()

from sqlalchemy.orm import Session
from sqlalchemy import text
from database.models import Drug, PMBIDrug, SIDERSideEffect, CDSCOAlert
from backend.schemas import DrugResponse, AlertItem, SideEffectItem, PricingItem

def search_drug(db: Session, query: str) -> DrugResponse:
    # 1. Clean the user's input
    query_lower = query.lower().strip()
    
    # ==========================================
    # PHASE 1: Fuzzy Search (Brand or Generic?)
    # ==========================================
    
    # Check 1: Did the user type a Brand Name? (e.g., "Dolo 650")
    # We use PostgreSQL's pg_trgm % operator for fuzzy text matching!
    brand_match = db.execute(
        text("""
        SELECT drug_id, brand_name
        FROM brand_mappings
        WHERE brand_name % :query
        ORDER BY similarity(brand_name, :query) DESC
        LIMIT 1
        """),
        {"query": query_lower}
    ).fetchone()
    
    drug_id = None
    matched_brand = None
    generic_name = None
    
    if brand_match:
        drug_id = brand_match.drug_id
        matched_brand = brand_match.brand_name
        
        # If we matched a brand, we look up the master Generic Name it belongs to!
        drug_obj = db.query(Drug).filter(Drug.id == drug_id).first()
        generic_name = drug_obj.generic_name if drug_obj else "Unknown"
        
    else:
        # Check 2: If it wasn't a brand, maybe they typed a Generic Name? (e.g., "Paracetamol")
        generic_match = db.execute(
            text("""
            SELECT id, generic_name
            FROM drugs
            WHERE generic_name % :query
            ORDER BY similarity(generic_name, :query) DESC
            LIMIT 1
            """),
            {"query": query_lower}
        ).fetchone()
        
        if generic_match:
            drug_id = generic_match.id
            generic_name = generic_match.generic_name
    
    # If the drug doesn't exist in our database at all, return None
    if not drug_id:
        return None

    # ==========================================
    # PHASE 2: Data Aggregation
    # ==========================================
    
    # Now that we successfully mapped the user's text to a Master `drug_id`, 
    # we can query the other tables!
    
    # Fetch 1: Regulatory Alerts
    alerts = db.query(CDSCOAlert).filter(CDSCOAlert.drug_id == drug_id).all()
    
    # Fetch 2: Side Effects (Limited to 20 so the UI doesn't lag)
    side_effects = db.query(SIDERSideEffect).filter(SIDERSideEffect.drug_id == drug_id).limit(20).all()
    
    # Fetch 3: Pricing Alternatives (Find cheaper PMBI generics!)
    pricing = db.query(PMBIDrug).filter(PMBIDrug.drug_id == drug_id).all()
    
    # ==========================================
    # PHASE 3: Build JSON Response (Pydantic)
    # ==========================================
    
    # We take all the messy database objects and pack them into our clean Pydantic schema
    response = DrugResponse(
        generic_name=generic_name.title(), # Capitalize for the UI
        matched_brand=matched_brand.title() if matched_brand else None,
        alerts=[
            AlertItem(
                alert_title=a.alert_title,
                description=a.description,
                alert_date=a.alert_date,
                source_url=a.source_url
            ) for a in alerts
        ],
        side_effects=[
            SideEffectItem(side_effect_name=se.side_effect_name) for se in side_effects
        ],
        cheaper_alternatives=[
            PricingItem(
                brand_name=p.brand_name.title(),
                dosage_form=p.dosage_form,
                strength=p.strength,
                mrp=p.mrp
            ) for p in pricing
        ]
    )
    
    return response

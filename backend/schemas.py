from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# -------------------------------------------------------------------
# Individual Item Schemas (The smaller puzzle pieces)
# -------------------------------------------------------------------

class AlertItem(BaseModel):
    alert_title: str
    description: str
    alert_date: date
    source_url: Optional[str] = None
    
    class Config:
        from_attributes = True

class SideEffectItem(BaseModel):
    side_effect_name: str
    
    class Config:
        from_attributes = True

class PricingItem(BaseModel):
    brand_name: str
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    mrp: Optional[Decimal] = None
    
    class Config:
        from_attributes = True

# -------------------------------------------------------------------
# Master Response Schema (The final JSON payload sent to the Website)
# -------------------------------------------------------------------

class DrugResponse(BaseModel):
    generic_name: str
    matched_brand: Optional[str] = None # Will be populated if user searched by a Brand Name
    
    # We embed lists of the smaller puzzle pieces inside our master response!
    alerts: List[AlertItem] = []
    side_effects: List[SideEffectItem] = []
    cheaper_alternatives: List[PricingItem] = []

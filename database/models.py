from sqlalchemy import Column, Integer, String, Numeric, Date, Text, Index, Boolean, DateTime, UniqueConstraint, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base
Base = declarative_base()
class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String, unique=True, index=True, nullable=False) # Standardized lowercase chemical name
    
    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    __table_args__ = (
        # GIN Trigram Index for fuzzy generic drug searches
        Index("ix_drugs_generic_name_trgm", generic_name, postgresql_using="gin", postgresql_ops={"generic_name": "gin_trgm_ops"}),
    )

class PMBIDrug(Base):
    __tablename__ = "pmbi_drugs"

    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    drug_code = Column(String, index=True, nullable=True)
    brand_name = Column(String, nullable=False)
    dosage_form = Column(String, nullable=True)
    strength = Column(String, nullable=True)
    mrp = Column(Numeric(10, 2), nullable=True)
    source_name = Column(String, nullable=True)
    
    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    __table_args__ = (
        # Unique constraint to prevent duplicate generic items
        UniqueConstraint("brand_name", "strength", name="uq_pmbi_drug_brand_strength"),
        # GIN Trigram Index for fuzzy brand searches
        Index("ix_pmbi_drugs_brand_name_trgm", brand_name, postgresql_using="gin", postgresql_ops={"brand_name": "gin_trgm_ops"}),
    )

class SIDERSideEffect(Base):
    __tablename__ = "sider_side_effects"

    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    stitch_id = Column(String, index=True, nullable=False) # e.g. CID100000085
    side_effect_name = Column(String, index=True, nullable=False) # name of side effect
    meddra_concept_id = Column(String, nullable=True)
    source_name = Column(String, nullable=True)
    
    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

class CDSCOAlert(Base):
    __tablename__ = "cdsco_alerts"

    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    alert_title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    alert_date = Column(Date, nullable=True)
    source_url = Column(String, nullable=True)
    source_name = Column(String, nullable=True)
    
    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    __table_args__ = (
        # Unique constraint on alerts to prevent duplicates
        UniqueConstraint("drug_id", "alert_title", "alert_date", name="uq_cdsco_alert"),
    )

class BrandMapping(Base):
    __tablename__ = "brand_mappings"

    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False)
    brand_name = Column(String, nullable=False)
    source_name = Column(String, nullable=True)

    # Audit Fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint("brand_name", "drug_id", name="uq_brand_mapping"),
        # GIN Index for fuzzy brand searches
        Index("ix_brand_mappings_brand_name_trgm", brand_name, postgresql_using="gin", postgresql_ops={"brand_name": "gin_trgm_ops"}),
    )

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="doctor")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    scan_date = Column(DateTime(timezone=True), server_default=func.now())
    extracted_text = Column(Text, nullable=True)
    image_path = Column(String, nullable=True)
    status = Column(String, nullable=True)
    analysis_result = Column(Text, nullable=True)



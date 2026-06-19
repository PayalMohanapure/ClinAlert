-- 1. Enable pg_trgm extension if not already done
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Drop existing tables to start fresh
DROP TABLE IF EXISTS brand_mappings CASCADE;
DROP TABLE IF EXISTS cdsco_alerts CASCADE;
DROP TABLE IF EXISTS sider_side_effects CASCADE;
DROP TABLE IF EXISTS pmbi_drugs CASCADE;
DROP TABLE IF EXISTS drugs CASCADE;

-- 3. Create Master Drugs Table
CREATE TABLE drugs (
    id SERIAL PRIMARY KEY,
    generic_name VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- GIN Trigram Index on generic_name for fuzzy search
CREATE INDEX ix_drugs_generic_name_trgm ON drugs USING gin (generic_name gin_trgm_ops);

-- 4. Create pmbi_drugs table
CREATE TABLE pmbi_drugs (
    id SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    drug_code VARCHAR,
    brand_name VARCHAR NOT NULL,
    dosage_form VARCHAR,
    strength VARCHAR,
    mrp NUMERIC(10,2),
    source_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_pmbi_drug_brand_strength UNIQUE (brand_name, strength)
);

-- GIN Trigram Index on brand_name for fuzzy search
CREATE INDEX ix_pmbi_drugs_brand_name_trgm ON pmbi_drugs USING gin (brand_name gin_trgm_ops);

-- 5. Create sider_side_effects table
CREATE TABLE sider_side_effects (
    id SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    stitch_id VARCHAR NOT NULL,
    side_effect_name VARCHAR NOT NULL,
    meddra_concept_id VARCHAR,
    source_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Index on side_effect_name
CREATE INDEX ix_sider_side_effects_side_effect_name ON sider_side_effects (side_effect_name);

-- 6. Create cdsco_alerts table
CREATE TABLE cdsco_alerts (
    id SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    alert_title VARCHAR NOT NULL,
    description TEXT,
    alert_date DATE,
    source_url VARCHAR,
    source_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_cdsco_alert UNIQUE (drug_id, alert_title, alert_date)
);

-- 7. Create brand_mappings table
CREATE TABLE brand_mappings (
    id SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    brand_name VARCHAR NOT NULL,
    source_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_brand_mapping UNIQUE (brand_name, drug_id)
);

-- GIN Trigram Index on brand_name for fuzzy search of commercial brand names
CREATE INDEX ix_brand_mappings_brand_name_trgm ON brand_mappings USING gin (brand_name gin_trgm_ops);


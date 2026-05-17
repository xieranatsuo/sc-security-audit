-- Smart Contract Audit Platform — PostgreSQL Schema
-- Run with: psql -f sql/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    audit_limit INTEGER DEFAULT 10,
    audits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit records
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    chain_name VARCHAR(50) NOT NULL,
    contract_name VARCHAR(255),
    compiler_version VARCHAR(50),
    risk_score DECIMAL(5,2),
    risk_label VARCHAR(20),
    total_findings INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    info_count INTEGER DEFAULT 0,
    source_code_length INTEGER,
    bytecode_size INTEGER,
    is_proxy BOOLEAN DEFAULT FALSE,
    implementation_address VARCHAR(42),
    audit_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Findings table
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    finding_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    score DECIMAL(4,1),
    category VARCHAR(100),
    cwe_id VARCHAR(20),
    location VARCHAR(500),
    code_snippet TEXT,
    recommendation TEXT,
    gas_impact INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract registry
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    chain_name VARCHAR(50) NOT NULL,
    contract_name VARCHAR(255),
    audit_count INTEGER DEFAULT 0,
    last_audit_id UUID REFERENCES audits(id),
    risk_score DECIMAL(5,2),
    risk_label VARCHAR(20),
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_audit_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(chain_id, address)
);

-- Monitoring alerts
CREATE TABLE monitor_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    tx_hash VARCHAR(66),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk scoring weights (configurable per user)
CREATE TABLE risk_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    severity_weight DECIMAL(4,3) DEFAULT 0.300,
    exploitability_weight DECIMAL(4,3) DEFAULT 0.250,
    attack_complexity_weight DECIMAL(4,3) DEFAULT 0.200,
    impact_weight DECIMAL(4,3) DEFAULT 0.150,
    detection_difficulty_weight DECIMAL(4,3) DEFAULT 0.100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT weights_sum_check CHECK (
        ABS(severity_weight + exploitability_weight + attack_complexity_weight + impact_weight + detection_difficulty_weight - 1.0) < 0.001
    )
);

-- Indexes
CREATE INDEX idx_audits_contract ON audits(chain_id, contract_address);
CREATE INDEX idx_audits_user ON audits(user_id);
CREATE INDEX idx_audits_created ON audits(created_at DESC);
CREATE INDEX idx_findings_audit ON findings(audit_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_contracts_chain ON contracts(chain_id);
CREATE INDEX idx_monitor_alerts_contract ON monitor_alerts(chain_id, contract_address);
CREATE INDEX idx_monitor_alerts_unread ON monitor_alerts(is_read, created_at DESC);

-- Migration: Create tables for TKDN Evaluation System
-- Run this file: psql -U [your_username] -d bmkg_p3dn -f 001_create_tables.sql
-- Table: evaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'under_review',
            'accepted',
            'rejected'
        )
    ),
    -- PPK Data
    ppk_nama VARCHAR(255),
    ppk_nip VARCHAR(50),
    ppk_no_hp VARCHAR(20),
    ppk_email VARCHAR(255),
    ppk_unit_kerja VARCHAR(255),
    ppk_jabatan VARCHAR(255),
    -- Workflow timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    presentation_date TIMESTAMP,
    -- Review data
    reviewed_by VARCHAR(255),
    review_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table: evaluation_documents (File storage)
CREATE TABLE IF NOT EXISTS evaluation_documents (
    id SERIAL PRIMARY KEY,
    evaluation_id VARCHAR(50) REFERENCES evaluations(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    file_data BYTEA NOT NULL,
    -- Store file as binary
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table: evaluation_items (Daftar barang)
CREATE TABLE IF NOT EXISTS evaluation_items (
    id SERIAL PRIMARY KEY,
    evaluation_id VARCHAR(50) REFERENCES evaluations(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER,
    unit VARCHAR(50),
    brand VARCHAR(255),
    model VARCHAR(255),
    specifications TEXT,
    category VARCHAR(100),
    final_price DECIMAL(15, 2),
    foreign_price DECIMAL(15, 2),
    bmp DECIMAL(5, 2),
    tkdn DECIMAL(5, 2),
    status VARCHAR(20) CHECK (status IN ('Lulus', 'Tidak Lulus')),
    regulation VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_documents_eval_id ON evaluation_documents(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_items_eval_id ON evaluation_items(evaluation_id);
-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
DROP TRIGGER IF EXISTS update_evaluations_updated_at ON evaluations;
CREATE TRIGGER update_evaluations_updated_at BEFORE
UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
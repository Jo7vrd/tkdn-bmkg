-- Migration: Add justification review status columns
-- Date: 2024
-- Description: Add columns to track justification document review status, reviewer, and rejection reason
-- Add justification review columns to evaluation_documents table
ALTER TABLE evaluation_documents
ADD COLUMN IF NOT EXISTS justification_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS justification_reviewed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS justification_reviewed_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS justification_rejection_reason TEXT;
-- Add check constraint for justification_status
ALTER TABLE evaluation_documents DROP CONSTRAINT IF EXISTS check_justification_status;
ALTER TABLE evaluation_documents
ADD CONSTRAINT check_justification_status CHECK (
        justification_status IN ('pending', 'approved', 'rejected')
    );
-- Add index for faster filtering by justification status
CREATE INDEX IF NOT EXISTS idx_evaluation_documents_justification_status ON evaluation_documents(justification_status);
-- Add comment to columns
COMMENT ON COLUMN evaluation_documents.justification_status IS 'Review status: pending, approved, rejected';
COMMENT ON COLUMN evaluation_documents.justification_reviewed_at IS 'Timestamp when document was reviewed';
COMMENT ON COLUMN evaluation_documents.justification_reviewed_by IS 'Name of admin who reviewed the document';
COMMENT ON COLUMN evaluation_documents.justification_rejection_reason IS 'Reason for rejection or notes for revision';
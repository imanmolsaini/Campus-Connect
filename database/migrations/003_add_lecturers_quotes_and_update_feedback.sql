-- Migration 003: Add Lecturers and Quotes tables, and update Lecturer Feedback
-- Created: 2024-01-08
-- Description: Introduces a dedicated lecturers table, a quotes table,
--              and updates the lecturer_feedback table to reference lecturers.

-- Create lecturers table
CREATE TABLE lecturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    profile_image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add lecturer_id to lecturer_feedback table
ALTER TABLE lecturer_feedback
ADD COLUMN lecturer_id UUID REFERENCES lecturers(id) ON DELETE SET NULL;

-- Update existing lecturer_feedback entries to link to lecturers
-- This is a simplified approach for new projects. In a real-world scenario
-- with existing data, you'd need more complex logic to match names
-- and create new lecturer entries if they don't exist.
-- For now, we'll assume new feedback will use lecturer_id.
-- Existing entries will have NULL for lecturer_id until manually migrated.

-- Create quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for new tables and updated column
CREATE INDEX idx_lecturers_name ON lecturers(name);
CREATE INDEX idx_lecturer_feedback_lecturer_id ON lecturer_feedback(lecturer_id);
CREATE INDEX idx_quotes_lecturer_id ON quotes(lecturer_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Record this migration
INSERT INTO migrations (migration_name) VALUES ('003_add_lecturers_quotes_and_update_feedback');

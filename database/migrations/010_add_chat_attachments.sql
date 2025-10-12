-- Migration: Add attachment support to chat messages
-- Description: Adds columns for file attachments in messages table

-- Add attachment columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS attachment_size INTEGER,
ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(100);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_attachment ON messages(attachment_path) WHERE attachment_path IS NOT NULL;

-- Add check constraint for attachment size (max 10MB)
ALTER TABLE messages 
ADD CONSTRAINT check_attachment_size CHECK (attachment_size IS NULL OR attachment_size <= 10485760);

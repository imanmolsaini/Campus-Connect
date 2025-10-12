-- Migration: Allow NULL message content for attachment-only messages
-- Created: 2025-01-11

-- Modify the messages table to allow NULL in the message column
-- This allows users to send attachments without text content
ALTER TABLE messages 
ALTER COLUMN message DROP NOT NULL;

-- Add a check constraint to ensure at least message or attachment exists
-- This will be enforced at the application level since we have attachment info in a separate table

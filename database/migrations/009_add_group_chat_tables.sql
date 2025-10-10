-- Migration: Add Group Chat Tables
-- Description: Creates tables for group chats and group members

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- First, drop the existing constraint if it exists, then alter the column to allow NULL
DO $$ 
BEGIN
    -- Drop the NOT NULL constraint on receiver_id
    ALTER TABLE messages ALTER COLUMN receiver_id DROP NOT NULL;
EXCEPTION
    WHEN others THEN
        -- Column might already allow NULL, continue
        NULL;
END $$;

-- Add group_id and is_group_message columns if they don't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_group_message BOOLEAN DEFAULT FALSE;

-- Drop the old constraint if it exists before adding the new one
DO $$ 
BEGIN
    ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_or_group_check;
EXCEPTION
    WHEN others THEN
        NULL;
END $$;

-- Add check constraint to ensure either receiver_id or group_id is set
ALTER TABLE messages 
ADD CONSTRAINT messages_receiver_or_group_check 
CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL AND is_group_message = FALSE) OR
    (receiver_id IS NULL AND group_id IS NOT NULL AND is_group_message = TRUE)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_group_id ON messages(group_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_groups_updated_at();

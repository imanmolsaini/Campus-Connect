-- Grant permissions for group chat tables

-- Grant permissions on groups table
GRANT SELECT, INSERT, UPDATE, DELETE ON groups TO campus_connect;
-- Removed sequence grants since we're using UUID, not SERIAL

-- Grant permissions on group_members table
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO campus_connect;
-- Removed sequence grants since we're using UUID, not SERIAL

-- Note: messages table permissions already granted in previous migration

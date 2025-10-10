-- Grant permissions for group chat tables

-- Grant permissions on groups table (UUID primary key, no sequence needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON groups TO campus_connect;

-- Grant permissions on group_members table (UUID primary key, no sequence needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO campus_connect;

-- Note: messages table permissions already granted in previous migration
-- Note: groups and group_members tables use UUID primary keys (gen_random_uuid()),
-- so there are no sequences to grant permissions on

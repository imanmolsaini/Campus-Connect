-- Grant permissions for chat attachments feature
-- This script grants necessary permissions on the attachment columns added to messages table

-- Removed reference to non-existent group_messages table
-- Both 1-on-1 and group chat messages are stored in the messages table
-- Updated username from campus_connect_user to campus_connect
GRANT SELECT, INSERT, UPDATE ON messages TO campus_connect;

-- Grant usage on sequences (if needed)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO campus_connect;

-- Ensure the user can access the uploads directory path
-- Note: File system permissions should be set separately on the server

COMMIT;

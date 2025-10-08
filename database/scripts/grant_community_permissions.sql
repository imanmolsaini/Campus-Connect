-- Grant permissions for community tables
-- NOTE: This script must be run as a PostgreSQL superuser (postgres)

GRANT ALL PRIVILEGES ON TABLE community_questions TO campus_connect;
GRANT ALL PRIVILEGES ON TABLE community_replies TO campus_connect;

-- Grant permissions on sequences if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO campus_connect;

-- Run this script with:
-- sudo -u postgres psql -d campus_connect_nz -f database/scripts/grant_community_permissions.sql

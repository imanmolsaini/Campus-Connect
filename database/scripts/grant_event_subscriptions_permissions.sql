-- Grant permissions for event_subscriptions table
-- Run this after creating the event_subscriptions table

GRANT ALL PRIVILEGES ON TABLE event_subscriptions TO campus_connect;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO campus_connect;

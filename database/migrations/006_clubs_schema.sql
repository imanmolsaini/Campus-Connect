-- First, ensure the roles exist
DO $$ 
BEGIN
    -- Create roles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user;
    END IF;
END $$;

-- Drop tables if they exist to ensure clean slate
DROP TABLE IF EXISTS club_posts CASCADE;
DROP TABLE IF EXISTS club_members CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;

-- Create clubs table
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500),  
  club_date DATE,
  club_time TIME,
  image_url VARCHAR(500),
  join_link VARCHAR(500),
  members_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create club_members table for tracking membership
CREATE TABLE club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'admin', 'moderator')),
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(club_id, user_id)
);

-- Create club_posts table for club announcements and discussions
CREATE TABLE club_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_announcement BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_clubs_user_id ON clubs(user_id);
CREATE INDEX idx_clubs_is_active ON clubs(is_active);
CREATE INDEX idx_clubs_created_at ON clubs(created_at DESC);

CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_members_role ON club_members(role);

CREATE INDEX idx_club_posts_club_id ON club_posts(club_id);
CREATE INDEX idx_club_posts_user_id ON club_posts(user_id);
CREATE INDEX idx_club_posts_created_at ON club_posts(created_at DESC);
CREATE INDEX idx_club_posts_is_pinned ON club_posts(is_pinned);
CREATE INDEX idx_club_posts_is_announcement ON club_posts(is_announcement);

-- Add trigger to update updated_at timestamp for clubs
CREATE OR REPLACE FUNCTION update_clubs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clubs_updated_at
    BEFORE UPDATE ON clubs
    FOR EACH ROW
    EXECUTE FUNCTION update_clubs_updated_at();

-- Add trigger to update updated_at timestamp for club_posts
CREATE OR REPLACE FUNCTION update_club_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_club_posts_updated_at
    BEFORE UPDATE ON club_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_club_posts_updated_at();

-- Add trigger to update members_count in clubs table
CREATE OR REPLACE FUNCTION update_club_members_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clubs SET members_count = members_count + 1 WHERE id = NEW.club_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clubs SET members_count = members_count - 1 WHERE id = OLD.club_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_club_members_count
    AFTER INSERT OR DELETE ON club_members
    FOR EACH ROW
    EXECUTE FUNCTION update_club_members_count();

-- Add trigger to ensure at least one admin per club
CREATE OR REPLACE FUNCTION ensure_club_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is the first member being added, make them an admin
    IF NOT EXISTS (SELECT 1 FROM club_members WHERE club_id = NEW.club_id) THEN
        NEW.role = 'admin';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_club_admin
    BEFORE INSERT ON club_members
    FOR EACH ROW
    EXECUTE FUNCTION ensure_club_admin();

-- Grant permissions to admin users
GRANT SELECT, INSERT, UPDATE, DELETE ON clubs TO admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON club_members TO admin_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON club_posts TO admin_role;

-- Grant permissions to sequences (if using serial IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO admin_role;

-- Grant limited permissions to regular users
GRANT SELECT ON clubs TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON club_members TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON club_posts TO app_user;

-- Grant usage on sequences to app_user as well
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Creator of Clubs/Admin can delete a club submission
-- 1. Enable row-level security (RLS) on clubs
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- 2. Allow club creators (user_id matches) to delete their own clubs
CREATE POLICY clubs_creator_delete_policy
ON clubs
FOR DELETE
USING (user_id = current_setting('app.current_user_id')::uuid);

-- 3. Allow club admins (from club_members) to delete the club
CREATE POLICY clubs_admin_delete_policy
ON clubs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM club_members cm
    WHERE cm.club_id = clubs.id
      AND cm.user_id = current_setting('app.current_user_id')::uuid
      AND cm.role = 'admin'
  )
);

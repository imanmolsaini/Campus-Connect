-- Migration 002: Seed Data
-- Created: 2024-01-07
-- Description: Insert initial test data

\i seeds.sql

-- Record this migration
INSERT INTO migrations (migration_name) VALUES ('002_seed_data');

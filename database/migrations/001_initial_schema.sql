-- Migration 001: Initial Schema Creation (test)
-- Created: 2024-01-07
-- Description: Create initial database schema for Campus Connect NZ

-- This migration creates the initial database structure
-- Run this file to set up the database from scratch

\i database/schema.sql

-- Record this migration
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (migration_name) VALUES ('001_initial_schema');

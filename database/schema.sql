-- Campus Connect NZ Database Schema
-- PostgreSQL Database Setup

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE note_type AS ENUM ('lecture_notes', 'assignment', 'exam_prep', 'tutorial', 'other');
CREATE TYPE faculty_type AS ENUM ('business', 'design_creative', 'engineering_computer_mathematical', 'health_environmental', 'maori_indigenous');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    role user_role DEFAULT 'student',
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint to ensure only AUT emails
    CONSTRAINT check_aut_email CHECK (email LIKE '%@autuni.ac.nz')
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    faculty faculty_type NOT NULL,
    year INTEGER NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_year_range CHECK (year >= 1 AND year <= 4),
    CONSTRAINT check_credits CHECK (credits > 0)
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_code VARCHAR(20) NOT NULL REFERENCES courses(code) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    type note_type NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    description TEXT,
    download_count INTEGER DEFAULT 0,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_file_size CHECK (file_size > 0)
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    difficulty_rating INTEGER,
    workload_rating INTEGER,
    would_recommend BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT check_difficulty_range CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    CONSTRAINT check_workload_range CHECK (workload_rating >= 1 AND workload_rating <= 5),
    -- Prevent duplicate reviews from same user for same course
    CONSTRAINT unique_user_course_review UNIQUE (course_id, user_id)
);

-- Lecturers table (NEW)
CREATE TABLE lecturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    profile_image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lecturer feedback table (MODIFIED)
CREATE TABLE lecturer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID REFERENCES lecturers(id) ON DELETE SET NULL, -- NEW: Link to lecturers table
    lecturer_name VARCHAR(100), -- Kept for backward compatibility/display, but new entries should use lecturer_id
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    anonymous BOOLEAN DEFAULT FALSE,
    teaching_quality INTEGER,
    communication_rating INTEGER,
    availability_rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_lecturer_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT check_teaching_quality_range CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
    CONSTRAINT check_communication_range CHECK (communication_rating >= 1 AND communication_rating <= 5),
    CONSTRAINT check_availability_range CHECK (availability_rating >= 1 AND availability_rating <= 5)
);

-- Quotes table (NEW)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID NOT NULL REFERENCES lecturers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verified ON users(verified);
CREATE INDEX idx_notes_uploader ON notes(uploader_id);
CREATE INDEX idx_notes_course ON notes(course_code);
CREATE INDEX idx_notes_approved ON notes(approved);
CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_lecturers_name ON lecturers(name); -- NEW
CREATE INDEX idx_lecturer_feedback_lecturer ON lecturer_feedback(lecturer_name);
CREATE INDEX idx_lecturer_feedback_lecturer_id ON lecturer_feedback(lecturer_id); -- NEW
CREATE INDEX idx_lecturer_feedback_course ON lecturer_feedback(course_id);
CREATE INDEX idx_quotes_lecturer_id ON quotes(lecturer_id); -- NEW
CREATE INDEX idx_quotes_user_id ON quotes(user_id); -- NEW

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); -- NEW
CREATE TRIGGER update_lecturer_feedback_updated_at BEFORE UPDATE ON lecturer_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); -- NEW

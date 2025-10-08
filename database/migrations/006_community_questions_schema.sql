-- Community Questions and Replies Schema
-- Allows students to ask questions and reply to each other

-- Create community_questions table
CREATE TABLE community_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create community_replies table
CREATE TABLE community_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_community_questions_user ON community_questions(user_id);
CREATE INDEX idx_community_questions_created ON community_questions(created_at DESC);
CREATE INDEX idx_community_replies_question ON community_replies(question_id);
CREATE INDEX idx_community_replies_user ON community_replies(user_id);

-- Apply updated_at triggers
CREATE TRIGGER update_community_questions_updated_at 
BEFORE UPDATE ON community_questions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_replies_updated_at 
BEFORE UPDATE ON community_replies 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Campus Connect NZ Seed Data
-- Test data for development and testing

-- Insert sample courses
INSERT INTO courses (name, code, faculty, year, description, credits) VALUES
('Introduction to Programming', 'COMP501', 'engineering_computer_mathematical', 1, 'Fundamentals of programming using Python and Java', 15),
('Web Development', 'COMP602', 'engineering_computer_mathematical', 2, 'HTML, CSS, JavaScript and modern web frameworks', 15),
('Database Systems', 'COMP603', 'engineering_computer_mathematical', 2, 'Relational databases, SQL, and database design', 15),
('Software Engineering', 'COMP704', 'engineering_computer_mathematical', 3, 'Software development methodologies and project management', 15),
('Machine Learning', 'COMP805', 'engineering_computer_mathematical', 3, 'Introduction to AI and machine learning algorithms', 15),
('Business Analytics', 'BUSN501', 'business', 1, 'Data analysis for business decision making', 15),
('Marketing Fundamentals', 'MKTG502', 'business', 1, 'Principles of marketing and consumer behavior', 15),
('Financial Accounting', 'ACCT503', 'business', 1, 'Basic accounting principles and financial statements', 15),
('Graphic Design Principles', 'DSGN501', 'design_creative', 1, 'Fundamentals of visual design and typography', 15),
('Digital Media Production', 'DSGN602', 'design_creative', 2, 'Video production and digital content creation', 15);

-- Insert sample users (passwords would be hashed in real application)
INSERT INTO users (name, email, password_hash, verified, role) VALUES
('John Smith', 'john.smith@autuni.ac.nz', '$2b$10$example.hash.for.password123', TRUE, 'student'),
('Sarah Johnson', 'sarah.johnson@autuni.ac.nz', '$2b$10$example.hash.for.password456', TRUE, 'student'),
('Mike Chen', 'mike.chen@autuni.ac.nz', '$2b$10$example.hash.for.password789', TRUE, 'student'),
('Emma Wilson', 'emma.wilson@autuni.ac.nz', '$2b$10$example.hash.for.passwordabc', TRUE, 'student'),
('Admin User', 'admin@autuni.ac.nz', '$2b$10$example.hash.for.adminpass', TRUE, 'admin'),
('Lisa Brown', 'lisa.brown@autuni.ac.nz', '$2b$10$example.hash.for.passworddef', FALSE, 'student'),
('David Lee', 'david.lee@autuni.ac.nz', '$2b$10$example.hash.for.passwordghi', TRUE, 'student'),
('Anna Taylor', 'anna.taylor@autuni.ac.nz', '$2b$10$example.hash.for.passwordjkl', TRUE, 'student');

-- Insert sample notes
INSERT INTO notes (uploader_id, course_code, title, type, file_path, file_size, description, approved) VALUES
((SELECT id FROM users WHERE email = 'john.smith@autuni.ac.nz'), 'COMP501', 'Python Basics - Week 1', 'lecture_notes', '/uploads/notes/python-basics-week1.pdf', 2048576, 'Comprehensive notes covering variables, data types, and basic operations', TRUE),
((SELECT id FROM users WHERE email = 'sarah.johnson@autuni.ac.nz'), 'COMP501', 'Assignment 1 Solution Guide', 'assignment', '/uploads/notes/comp501-assignment1-guide.pdf', 1536000, 'Step-by-step solution for the first programming assignment', TRUE),
((SELECT id FROM users WHERE email = 'mike.chen@autuni.ac.nz'), 'COMP602', 'HTML & CSS Cheat Sheet', 'tutorial', '/uploads/notes/html-css-cheatsheet.pdf', 512000, 'Quick reference for HTML tags and CSS properties', TRUE),
((SELECT id FROM users WHERE email = 'emma.wilson@autuni.ac.nz'), 'COMP603', 'SQL Query Examples', 'lecture_notes', '/uploads/notes/sql-query-examples.pdf', 1024000, 'Common SQL queries with explanations and examples', TRUE),
((SELECT id FROM users WHERE email = 'david.lee@autuni.ac.nz'), 'BUSN501', 'Business Analytics Exam Prep', 'exam_prep', '/uploads/notes/busn501-exam-prep.pdf', 3072000, 'Summary of key concepts for the final exam', FALSE),
((SELECT id FROM users WHERE email = 'anna.taylor@autuni.ac.nz'), 'DSGN501', 'Typography Guidelines', 'tutorial', '/uploads/notes/typography-guidelines.pdf', 2560000, 'Best practices for typography in design projects', TRUE);

-- Insert sample reviews
INSERT INTO reviews (course_id, user_id, rating, comment, anonymous, difficulty_rating, workload_rating, would_recommend) VALUES
((SELECT id FROM courses WHERE code = 'COMP501'), (SELECT id FROM users WHERE email = 'john.smith@autuni.ac.nz'), 5, 'Excellent introduction to programming. The lecturer explains concepts clearly and the assignments are well-structured.', FALSE, 2, 3, TRUE),
((SELECT id FROM courses WHERE code = 'COMP501'), (SELECT id FROM users WHERE email = 'sarah.johnson@autuni.ac.nz'), 4, 'Good course overall, but could use more practical examples.', FALSE, 3, 3, TRUE),
((SELECT id FROM courses WHERE code = 'COMP602'), (SELECT id FROM users WHERE email = 'mike.chen@autuni.ac.nz'), 5, 'Love this course! Very practical and relevant to current web development trends.', FALSE, 3, 4, TRUE),
((SELECT id FROM courses WHERE code = 'COMP603'), (SELECT id FROM users WHERE email = 'emma.wilson@autuni.ac.nz'), 3, 'The content is important but the delivery could be improved.', TRUE, 4, 4, FALSE),
((SELECT id FROM courses WHERE code = 'BUSN501'), (SELECT id FROM users WHERE email = 'david.lee@autuni.ac.nz'), 4, 'Great for understanding business fundamentals.', FALSE, 2, 2, TRUE),
((SELECT id FROM courses WHERE code = 'DSGN501'), (SELECT id FROM users WHERE email = 'anna.taylor@autuni.ac.nz'), 5, 'Amazing course for creative students. Lots of hands-on projects.', FALSE, 2, 3, TRUE);

-- Insert sample lecturers (NEW)
INSERT INTO lecturers (name, profile_image_url, description) VALUES
('Dr. James Wilson', '/placeholder.svg?height=160&width=120', 'Specializes in programming languages and algorithms.'),
('Prof. Maria Garcia', '/placeholder.svg?height=160&width=120', 'Expert in web development and user experience.'),
('Dr. Robert Kim', '/placeholder.svg?height=160&width=120', 'Focuses on database systems and data modeling.'),
('Ms. Jennifer Lee', '/placeholder.svg?height=160&width=120', 'Teaches business analytics and strategic management.'),
('Prof. Alex Thompson', '/placeholder.svg?height=160&width=120', 'Leads courses in graphic design and digital media.'),
('John Doe', '/placeholder.svg?height=160&width=120', 'Teaches various computer science subjects.'),
('Sam Smith', '/placeholder.svg?height=160&width=120', 'Specializes in business and marketing.');

-- Insert sample lecturer feedback (MODIFIED to use lecturer_id)
INSERT INTO lecturer_feedback (lecturer_id, lecturer_name, course_id, user_id, rating, comment, anonymous, teaching_quality, communication_rating, availability_rating) VALUES
((SELECT id FROM lecturers WHERE name = 'Dr. James Wilson'), 'Dr. James Wilson', (SELECT id FROM courses WHERE code = 'COMP501'), (SELECT id FROM users WHERE email = 'john.smith@autuni.ac.nz'), 5, 'Dr. Wilson is an excellent teacher who makes complex concepts easy to understand.', FALSE, 5, 5, 4),
((SELECT id FROM lecturers WHERE name = 'Prof. Maria Garcia'), 'Prof. Maria Garcia', (SELECT id FROM courses WHERE code = 'COMP602'), (SELECT id FROM users WHERE email = 'mike.chen@autuni.ac.nz'), 4, 'Very knowledgeable and up-to-date with industry trends.', FALSE, 4, 4, 3),
((SELECT id FROM lecturers WHERE name = 'Dr. Robert Kim'), 'Dr. Robert Kim', (SELECT id FROM courses WHERE code = 'COMP603'), (SELECT id FROM users WHERE email = 'emma.wilson@autuni.ac.nz'), 3, 'Knows the subject well but lectures can be dry.', TRUE, 3, 2, 3),
((SELECT id FROM lecturers WHERE name = 'Ms. Jennifer Lee'), 'Ms. Jennifer Lee', (SELECT id FROM courses WHERE code = 'BUSN501'), (SELECT id FROM users WHERE email = 'david.lee@autuni.ac.nz'), 4, 'Great at connecting theory to real-world applications.', FALSE, 4, 4, 4),
((SELECT id FROM lecturers WHERE name = 'Prof. Alex Thompson'), 'Prof. Alex Thompson', (SELECT id FROM courses WHERE code = 'DSGN501'), (SELECT id FROM users WHERE email = 'anna.taylor@autuni.ac.nz'), 5, 'Inspiring teacher who really cares about student success.', FALSE, 5, 5, 5);

-- Insert sample quotes (NEW)
INSERT INTO quotes (lecturer_id, user_id, quote_text, context) VALUES
((SELECT id FROM lecturers WHERE name = 'Dr. James Wilson'), (SELECT id FROM users WHERE email = 'john.smith@autuni.ac.nz'), 'The best code is no code.', 'During a lecture on software design principles.'),
((SELECT id FROM lecturers WHERE name = 'Prof. Maria Garcia'), (SELECT id FROM users WHERE email = 'sarah.johnson@autuni.ac.nz'), 'CSS is like a puzzle, sometimes you just need to rotate the piece.', 'While debugging a tricky layout issue in class.'),
((SELECT id FROM lecturers WHERE name = 'Dr. Robert Kim'), (SELECT id FROM users WHERE email = 'mike.chen@autuni.ac.nz'), 'Normalization is key to a healthy database.', 'Emphasizing database design best practices.'),
((SELECT id FROM lecturers WHERE name = 'Ms. Jennifer Lee'), (SELECT id FROM users WHERE email = 'emma.wilson@autuni.ac.nz'), 'Data without context is just noise.', 'Discussing the importance of data interpretation in business analytics.'),
((SELECT id FROM lecturers WHERE name = 'Prof. Alex Thompson'), (SELECT id FROM users WHERE email = 'david.lee@autuni.ac.nz'), 'Design is thinking made visual.', 'Opening remarks in a graphic design class.'),
((SELECT id FROM lecturers WHERE name = 'John Doe'), (SELECT id FROM users WHERE email = 'john.smith@autuni.ac.nz'), 'Always comment your code, even if it feels obvious.', 'During a coding workshop.'),
((SELECT id FROM lecturers WHERE name = 'Sam Smith'), (SELECT id FROM users WHERE email = 'sarah.johnson@autuni.ac.nz'), 'The customer is always right, even when they are wrong.', 'In a lecture on business ethics.');

-- Update download counts for some notes
UPDATE notes SET download_count = 25 WHERE title = 'Python Basics - Week 1';
UPDATE notes SET download_count = 18 WHERE title = 'HTML & CSS Cheat Sheet';
UPDATE notes SET download_count = 32 WHERE title = 'SQL Query Examples';
UPDATE notes SET download_count = 12 WHERE title = 'Typography Guidelines';

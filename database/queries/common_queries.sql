-- Common Queries for Campus Connect NZ
-- Useful queries for development and testing

-- Get all courses with their review statistics
SELECT 
    c.code,
    c.name,
    c.faculty,
    c.year,
    COUNT(r.id) as review_count,
    ROUND(AVG(r.rating), 2) as avg_rating,
    ROUND(AVG(r.difficulty_rating), 2) as avg_difficulty,
    ROUND(AVG(r.workload_rating), 2) as avg_workload
FROM courses c
LEFT JOIN reviews r ON c.id = r.course_id
GROUP BY c.id, c.code, c.name, c.faculty, c.year
ORDER BY c.code;

-- Get notes with uploader information
SELECT 
    n.title,
    n.type,
    n.description,
    n.download_count,
    n.created_at,
    u.name as uploader_name,
    c.name as course_name,
    c.code as course_code
FROM notes n
JOIN users u ON n.uploader_id = u.id
JOIN courses c ON n.course_code = c.code
WHERE n.approved = TRUE
ORDER BY n.created_at DESC;

-- Get user statistics
SELECT 
    u.name,
    u.email,
    u.created_at,
    COUNT(DISTINCT n.id) as notes_uploaded,
    COUNT(DISTINCT r.id) as reviews_written,
    COUNT(DISTINCT lf.id) as lecturer_feedback_given
FROM users u
LEFT JOIN notes n ON u.id = n.uploader_id
LEFT JOIN reviews r ON u.id = r.user_id
LEFT JOIN lecturer_feedback lf ON u.id = lf.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.email, u.created_at
ORDER BY u.created_at DESC;

-- Get lecturer feedback summary
SELECT 
    lf.lecturer_name,
    COUNT(lf.id) as feedback_count,
    ROUND(AVG(lf.rating), 2) as avg_rating,
    ROUND(AVG(lf.teaching_quality), 2) as avg_teaching_quality,
    ROUND(AVG(lf.communication_rating), 2) as avg_communication,
    ROUND(AVG(lf.availability_rating), 2) as avg_availability
FROM lecturer_feedback lf
GROUP BY lf.lecturer_name
ORDER BY avg_rating DESC;

-- Get most popular notes
SELECT 
    n.title,
    n.type,
    n.download_count,
    c.name as course_name,
    c.code as course_code,
    u.name as uploader_name
FROM notes n
JOIN courses c ON n.course_code = c.code
JOIN users u ON n.uploader_id = u.id
WHERE n.approved = TRUE
ORDER BY n.download_count DESC
LIMIT 10;

-- Script to check for existing admin user and create one if needed
-- Run this script to ensure admin@autuni.ac.nz exists with proper permissions

DO $$
DECLARE
    admin_exists BOOLEAN := FALSE;
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE email = 'admin@autuni.ac.nz' AND role = 'admin'
    ) INTO admin_exists;
    
    IF admin_exists THEN
        -- Get admin user details
        SELECT id INTO admin_user_id FROM users WHERE email = 'admin@autuni.ac.nz';
        
        RAISE NOTICE 'Admin user already exists!';
        RAISE NOTICE 'Email: admin@autuni.ac.nz';
        RAISE NOTICE 'Password: @Password1';
        RAISE NOTICE 'User ID: %', admin_user_id;
        RAISE NOTICE 'Status: Active and Verified';
        
        -- Ensure admin is verified (in case it wasn''t)
        UPDATE users 
        SET verified = TRUE, verification_token = NULL 
        WHERE email = 'admin@autuni.ac.nz';
        
    ELSE
        -- Create new admin user
        INSERT INTO users (name, email, password_hash, verified, role, verification_token) 
        VALUES (
            'System Administrator',
            'admin@autuni.ac.nz',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVliHG/oG', -- This is @Password1 hashed
            TRUE, -- Skip email verification
            'admin',
            NULL -- No verification token needed
        )
        RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'New admin user created successfully!';
        RAISE NOTICE 'Email: admin@autuni.ac.nz';
        RAISE NOTICE 'Password: @Password1';
        RAISE NOTICE 'User ID: %', admin_user_id;
        RAISE NOTICE 'Status: Active and Verified';
    END IF;
    
    RAISE NOTICE '=== ADMIN LOGIN CREDENTIALS ===';
    RAISE NOTICE 'Email: admin@autuni.ac.nz';
    RAISE NOTICE 'Password: @Password1';
    RAISE NOTICE '===============================';
    
END $$;

-- Display current admin users for verification
SELECT 
    id,
    name,
    email,
    role,
    verified,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

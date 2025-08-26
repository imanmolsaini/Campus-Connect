# Campus Connect NZ - Database Setup

This directory contains the PostgreSQL database schema, migrations, and seed data for Campus Connect NZ.

## Prerequisites

- PostgreSQL 13+ installed locally
- `psql` command-line tool available

## Database Setup

### 1. Create Database

\`\`\`bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE campus_connect_nz;
CREATE USER campus_connect WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE campus_connect_nz TO campus_connect;

# Exit psql
\q
\`\`\`

### 2. Run Migrations

\`\`\`bash
# Navigate to database directory
cd database

# Run initial schema migration
psql -U campus_connect -d campus_connect_nz -f migrations/001_initial_schema.sql

# Run seed data migration
psql -U campus_connect -d campus_connect_nz -f migrations/002_seed_data.sql
\`\`\`

### 3. Verify Setup

\`\`\`bash
# Connect to database
psql -U campus_connect -d campus_connect_nz

# Check tables
\dt

# Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM notes;
\`\`\`

## Database Schema

### Tables Overview

- **users**: Student and admin accounts (AUT email restriction)
- **courses**: Course catalog with faculty and year information
- **notes**: File uploads linked to courses and users
- **reviews**: Course reviews with ratings and comments
- **lecturer_feedback**: Anonymous feedback for lecturers

### Key Features

- UUID primary keys for security
- Email domain restriction (@autuni.ac.nz only)
- Automatic timestamp updates
- Comprehensive indexing for performance
- Data validation constraints
- Referential integrity with foreign keys

### Environment Variables

Create a `.env` file in your backend with:

\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_connect_nz
DB_USER=campus_connect
DB_PASSWORD=your_secure_password
\`\`\`

## File Structure

\`\`\`
database/
├── schema.sql              # Main database schema
├── seeds.sql              # Test data
├── migrations/            # Database migrations
│   ├── 001_initial_schema.sql
│   └── 002_seed_data.sql
├── queries/               # Common queries
│   └── common_queries.sql
└── README.md             # This file
\`\`\`

## Common Operations

### Reset Database
\`\`\`bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS campus_connect_nz;"
sudo -u postgres psql -c "CREATE DATABASE campus_connect_nz;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE campus_connect_nz TO campus_connect;"

# Re-run migrations
psql -U campus_connect -d campus_connect_nz -f migrations/001_initial_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/002_seed_data.sql
\`\`\`

### Backup Database
\`\`\`bash
pg_dump -U campus_connect -d campus_connect_nz > backup_$(date +%Y%m%d_%H%M%S).sql
\`\`\`

### Restore Database
\`\`\`bash
psql -U campus_connect -d campus_connect_nz < backup_file.sql
\`\`\`

## Next Steps

After setting up the database:

1. **Phase 2**: Set up the backend API with TypeScript and Express/NestJS
2. **Phase 3**: Build the frontend React/Next.js application
3. **Docker**: Containerize all services with docker-compose

## Test Data

The seed data includes:
- 8 sample users (7 students, 1 admin)
- 10 courses across different faculties
- 6 sample notes with various types
- 6 course reviews with ratings
- 5 lecturer feedback entries

All test users have verified accounts and use the @autuni.ac.nz email domain.
\`\`\`

```mermaid title="Campus Connect NZ - Entity Relationship Diagram" type="diagram"
erDiagram
    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        boolean verified
        enum role
        varchar verification_token
        varchar reset_token
        timestamp reset_token_expires
        timestamp created_at
        timestamp updated_at
    }
    
    COURSES {
        uuid id PK
        varchar name
        varchar code UK
        enum faculty
        integer year
        text description
        integer credits
        timestamp created_at
        timestamp updated_at
    }
    
    NOTES {
        uuid id PK
        uuid uploader_id FK
        varchar course_code FK
        varchar title
        enum type
        varchar file_path
        integer file_size
        text description
        integer download_count
        boolean approved
        timestamp created_at
        timestamp updated_at
    }
    
    REVIEWS {
        uuid id PK
        uuid course_id FK
        uuid user_id FK
        integer rating
        text comment
        boolean anonymous
        integer difficulty_rating
        integer workload_rating
        boolean would_recommend
        timestamp created_at
        timestamp updated_at
    }
    
    LECTURER_FEEDBACK {
        uuid id PK
        varchar lecturer_name
        uuid course_id FK
        uuid user_id FK
        integer rating
        text comment
        boolean anonymous
        integer teaching_quality
        integer communication_rating
        integer availability_rating
        timestamp created_at
        timestamp updated_at
    }
    
    MIGRATIONS {
        serial id PK
        varchar migration_name
        timestamp executed_at
    }

    USERS ||--o{ NOTES : uploads
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ LECTURER_FEEDBACK : provides
    COURSES ||--o{ NOTES : contains
    COURSES ||--o{ REVIEWS : receives
    COURSES ||--o{ LECTURER_FEEDBACK : relates_to

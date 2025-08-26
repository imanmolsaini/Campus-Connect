# Campus Connect NZ

Campus Connect NZ is a platform designed for AUT University students to share study resources, review courses, provide lecturer feedback, and connect with fellow students. The platform aims to enhance the academic experience by fostering a collaborative learning environment.

## 🚀 Features

- **Share Study Notes**: Upload and access lecture notes, assignments, and study materials from fellow AUT students
- **Course Reviews**: Read honest reviews about courses, difficulty levels, and workload from students who have taken them
- **Lecturer Feedback**: Provide anonymous feedback about lecturers to help improve the learning experience
- **Student Community**: Connect with fellow AUT students and build a supportive academic community
- **Lecturer Quotes**: Share memorable quotes from lecturers
- **Student Deals**: Find and share student discounts and deals
- **Secure & Private**: Authentication with AUT email addresses only (@autuni.ac.nz)

## 🏗️ Project Structure

```
├── backend/            # Express TypeScript API server
│   ├── src/            # Source code
│   │   ├── app.ts      # Express application setup
│   │   ├── server.ts   # Server entry point
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route controllers
│   │   ├── middleware/ # Express middleware
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── types/      # TypeScript type definitions
│   └── scripts/        # Utility scripts
├── frontend/           # Next.js React application
│   ├── src/            # Source code
│   │   ├── app/        # Next.js app directory
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom React hooks
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript type definitions
└── database/           # PostgreSQL database
    ├── migrations/     # Database migrations
    ├── queries/        # Common SQL queries
    ├── schema.sql      # Database schema
    └── seeds.sql       # Seed data
```

## 🛠️ Tech Stack

### Backend
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **File Storage**: Local file system with Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **API Client**: Axios, React Query
- **UI Components**: Custom components with Lucide React icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Git

### Database Setup

1. Create a PostgreSQL database:

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE campus_connect_nz;
CREATE USER campus_connect WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE campus_connect_nz TO campus_connect;

# Exit psql
\q
```

2. Run migrations:

```bash
# Navigate to database directory
cd database

# Run initial schema migration
psql -U campus_connect -d campus_connect_nz -f migrations/001_initial_schema.sql

# Run seed data migration
psql -U campus_connect -d campus_connect_nz -f migrations/002_seed_data.sql

# Run additional migrations
psql -U campus_connect -d campus_connect_nz -f migrations/003_add_lecturers_quotes_and_update_feedback.sql
psql -U campus_connect -d campus_connect_nz -f migrations/003_deals_schema.sql
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:

```
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_connect_nz
DB_USER=campus_connect
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
FROM_EMAIL=noreply@campusconnectnz.com
```

4. Build and start the backend server:

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the frontend directory with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the frontend development server:

```bash
npm run dev
```

5. For production build:

```bash
npm run build
npm start
```

## 📝 Database Schema

The database includes the following main tables:

- **users**: Student and admin accounts (AUT email restriction)
- **courses**: Course catalog with faculty and year information
- **notes**: File uploads linked to courses and users
- **reviews**: Course reviews with ratings and comments
- **lecturers**: Information about lecturers
- **lecturer_feedback**: Anonymous feedback for lecturers
- **quotes**: Memorable quotes from lecturers
- **deals**: Student discounts and deals
- **deal_votes**: Upvotes/downvotes for deals

## 🔒 Authentication

The platform uses JWT-based authentication with the following features:

- Email verification required (AUT email addresses only)
- Password reset functionality
- Role-based access control (student/admin)

## 🧪 Testing

Run tests with:

```bash
# Backend tests
cd backend
npm test

# Frontend type checking
cd frontend
npm run type-check
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
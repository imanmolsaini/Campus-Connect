<div align="center">

# 🎓 Campus Connect NZ

**A comprehensive platform for AUT University students to share resources, connect, and enhance their academic experience**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-blue)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Performance](#-performance)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Campus Connect NZ is a modern, full-stack web application designed exclusively for AUT University students. The platform creates a collaborative academic environment where students can share study materials, review courses, provide lecturer feedback, and connect with their peers.

### Key Objectives
- **Resource Sharing**: Centralized platform for study materials and notes
- **Academic Transparency**: Honest course and lecturer reviews
- **Community Building**: Foster connections between AUT students
- **Student Support**: Deals, quotes, and peer assistance

## ✨ Features

### 📚 Academic Resources
- **Study Notes Sharing**: Upload and access lecture notes, assignments, and study materials
- **Course Reviews**: Comprehensive reviews with ratings, difficulty levels, and workload insights
- **Lecturer Feedback**: Anonymous feedback system to improve teaching quality

### 🤝 Community Features
- **Student Networking**: Connect with fellow AUT students across different programs
- **Memorable Quotes**: Share and discover inspiring quotes from lecturers
- **Student Deals**: Exclusive discounts and deals for AUT students with voting system

### 🔒 Security & Privacy
- **AUT Email Verification**: Restricted access using @autuni.ac.nz email addresses
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access**: Student and admin role management
- **Anonymous Feedback**: Privacy-protected lecturer feedback system

## 🛠️ Tech Stack

### Backend Infrastructure
| Technology | Purpose | Version |
|------------|---------|---------|
| **TypeScript** | Type-safe development | 5.0+ |
| **Express.js** | Web application framework | Latest |
| **PostgreSQL** | Primary database | 13+ |
| **JWT** | Authentication tokens | Latest |
| **bcrypt** | Password hashing | Latest |
| **Multer** | File upload handling | Latest |
| **Nodemailer** | Email services | Latest |

### Frontend Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | 14+ |
| **React** | UI library | 18+ |
| **TypeScript** | Type safety | 5.0+ |
| **Tailwind CSS** | Styling framework | Latest |
| **React Hook Form** | Form management | Latest |
| **Axios** | HTTP client | Latest |
| **React Query** | Data fetching & caching | Latest |
| **Lucide React** | Icon library | Latest |

## 🏗️ Project Architecture

\`\`\`
campus-connect-nz/
├── 📁 backend/                 # Express.js API Server
│   ├── 📁 src/
│   │   ├── 📄 app.ts          # Express application setup
│   │   ├── 📄 server.ts       # Server entry point
│   │   ├── 📁 config/         # Configuration files
│   │   ├── 📁 controllers/    # Route controllers
│   │   ├── 📁 middleware/     # Express middleware
│   │   ├── 📁 routes/         # API route definitions
│   │   ├── 📁 services/       # Business logic layer
│   │   └── 📁 types/          # TypeScript definitions
│   ├── 📁 scripts/            # Utility scripts
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
├── 📁 frontend/               # Next.js React Application
│   ├── 📁 src/
│   │   ├── 📁 app/            # Next.js app directory
│   │   ├── 📁 components/     # Reusable React components
│   │   ├── 📁 contexts/       # React context providers
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 services/       # API service layer
│   │   └── 📁 types/          # TypeScript definitions
│   ├── 📁 public/             # Static assets
│   ├── 📄 package.json
│   └── 📄 next.config.js
├── 📁 database/               # PostgreSQL Database
│   ├── 📁 migrations/         # Database migration files
│   ├── 📁 queries/            # Common SQL queries
│   ├── 📄 schema.sql          # Database schema definition
│   └── 📄 seeds.sql           # Initial seed data
└── 📄 README.md
\`\`\`

## 🚀 Quick Start

### Prerequisites Checklist
- [ ] **Node.js** 18.0.0 or higher
- [ ] **npm** or **yarn** package manager
- [ ] **PostgreSQL** 13.0 or higher
- [ ] **Git** version control

### One-Command Setup
\`\`\`bash
# Clone and setup the entire project
git clone https://github.com/yourusername/campus-connect-nz.git
cd campus-connect-nz
npm run setup:all
\`\`\`

## 📖 Detailed Setup

### 1. Database Configuration

#### Create Database
\`\`\`bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE campus_connect_nz;
CREATE USER campus_connect WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE campus_connect_nz TO campus_connect;
\q
\`\`\`

#### Run Migrations
\`\`\`bash
cd database

# Execute migrations in order
psql -U campus_connect -d campus_connect_nz -f migrations/001_initial_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/002_seed_data.sql
psql -U campus_connect -d campus_connect_nz -f migrations/003_add_lecturers_quotes_and_update_feedback.sql
psql -U campus_connect -d campus_connect_nz -f migrations/003_deals_schema.sql
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
\`\`\`

#### Environment Variables
\`\`\`env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_connect_nz
DB_USER=campus_connect
DB_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@campusconnectnz.com

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads
\`\`\`

#### Start Backend Server
\`\`\`bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
\`\`\`

### 3. Frontend Setup

\`\`\`bash
cd frontend
npm install

# Create environment file
cp .env.local.example .env.local
\`\`\`

#### Frontend Environment Variables
\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
\`\`\`

#### Start Frontend Server
\`\`\`bash
# Development mode
npm run dev

# Production build
npm run build
npm start
\`\`\`

## 📚 API Documentation

### Authentication Endpoints
\`\`\`
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
POST   /api/auth/refresh      # Refresh JWT token
POST   /api/auth/forgot       # Password reset request
POST   /api/auth/reset        # Password reset confirmation
\`\`\`

### Core Resource Endpoints
\`\`\`
# Notes Management
GET    /api/notes             # List all notes
POST   /api/notes             # Upload new note
GET    /api/notes/:id         # Get specific note
PUT    /api/notes/:id         # Update note
DELETE /api/notes/:id         # Delete note

# Course Reviews
GET    /api/reviews           # List course reviews
POST   /api/reviews           # Create review
GET    /api/reviews/:id       # Get specific review
PUT    /api/reviews/:id       # Update review
DELETE /api/reviews/:id       # Delete review

# Lecturer Feedback
GET    /api/lecturers         # List lecturers
POST   /api/lecturers/feedback # Submit feedback
GET    /api/lecturers/:id/feedback # Get lecturer feedback

# Student Deals
GET    /api/deals             # List deals
POST   /api/deals             # Create deal
POST   /api/deals/:id/vote    # Vote on deal
\`\`\`

## 🗄️ Database Schema

### Core Tables Overview

#### Users Table
\`\`\`sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'student',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
\`\`\`

#### Courses Table
\`\`\`sql
courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  semester VARCHAR(20) NOT NULL
)
\`\`\`

#### Notes Table
\`\`\`sql
notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  course_id INTEGER REFERENCES courses(id),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
\`\`\`

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Email Verification**: Required AUT email verification
- **Role-Based Access**: Student and admin permissions

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size restrictions
- **Rate Limiting**: API endpoint protection

### Privacy Measures
- **Anonymous Feedback**: Lecturer feedback anonymization
- **Data Encryption**: Sensitive data encryption at rest
- **CORS Configuration**: Proper cross-origin policies

## ⚡ Performance

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching Strategy**: Redis for session management
- **File Compression**: Optimized file storage

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for better loading
- **Image Optimization**: Next.js automatic optimization
- **Bundle Analysis**: Regular bundle size monitoring
- **Lazy Loading**: Component-level lazy loading

## 🚀 Deployment

### Production Environment Setup

#### Using Docker (Recommended)
\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f
\`\`\`

#### Manual Deployment
\`\`\`bash
# Backend deployment
cd backend
npm run build
npm run start:prod

# Frontend deployment
cd frontend
npm run build
npm run start
\`\`\`

### Environment-Specific Configurations
- **Development**: Hot reload, debug logging
- **Staging**: Production-like with test data
- **Production**: Optimized builds, monitoring

## 🧪 Testing

### Backend Testing
\`\`\`bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
\`\`\`

### Frontend Testing
\`\`\`bash
cd frontend

# Run component tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check
\`\`\`

### Testing Strategy
- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load and stress testing

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
\`\`\`bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U campus_connect -d campus_connect_nz -c "SELECT 1;"
\`\`\`

#### Port Conflicts
\`\`\`bash
# Check port usage
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Kill process if needed
kill -9 <PID>
\`\`\`

#### Environment Variables
\`\`\`bash
# Verify environment variables are loaded
cd backend && npm run env:check
cd frontend && npm run env:check
\`\`\`

### Debug Mode
Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
DEBUG=campus-connect:*
\`\`\`

## 🤝 Contributing

We welcome contributions from the AUT community! Please follow our contribution guidelines.

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting consistency
- **Conventional Commits**: Standardized commit messages

### Pull Request Guidelines
- Provide clear description of changes
- Include relevant tests
- Update documentation if needed
- Ensure all CI checks pass

## 📞 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/imanmolsaini/campus-connect-nz/issues)
- **Discussions**: [GitHub Discussions](https://github.com/imanmolsaini/campus-connect-nz/discussions)
- **Email**: support@campusconnectnz.com

### Community
- **Discord**: [Join our community](https://discord.gg/campusconnectnz)
- **AUT Students**: Connect through official AUT channels

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by AUT Students, for AUT Students**

[⭐ Star this repo](https://github.com/yourusername/campus-connect-nz) • [🐛 Report Bug](https://github.com/imanmolsaini/campus-connect-nz/issues) • [💡 Request Feature](https://github.com/imanmolsaini/campus-connect-nz/issues)

</div>

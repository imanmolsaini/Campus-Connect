<div align="center">

# 🎓Campus Connect NZ

**A Comprehensive Academic Platform for AUT University Students**

*University Project - Software Development Course*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-blue)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)](https://nextjs.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [How to Use](#-how-to-use-each-feature) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [How to Use Each Feature](#-how-to-use-each-feature)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Project Team](#-project-team)
- [License](#-license)

---

## 🎯 Project Overview

### About Campus Connect NZ

Campus Connect NZ is a full-stack web application developed as a university project for AUT University's Software Development course. The platform addresses the need for a centralized, student-focused ecosystem where AUT students can collaborate, share resources, and build meaningful connections within their academic community.

### Problem Statement

Students at AUT University face several challenges:
- **Fragmented Resources**: Study materials scattered across multiple platforms
- **Limited Course Insights**: Difficulty finding honest reviews about courses and lecturers
- **Isolated Learning**: Lack of centralized platform for peer collaboration
- **Information Gap**: No dedicated space for student deals, events, and opportunities

### Solution

Campus Connect NZ provides a unified platform that:
- Centralizes academic resources and study materials
- Enables transparent course and lecturer feedback
- Facilitates student networking and collaboration
- Aggregates student-relevant opportunities and events

### Project Goals

1. **Academic Excellence**: Support students' learning through resource sharing
2. **Community Building**: Foster connections between AUT students
3. **Transparency**: Provide honest insights into courses and teaching quality
4. **Student Welfare**: Share deals, opportunities, and campus events

---

## ✨ Features

### 🔐 1. Authentication & User Management

**Description**: Secure authentication system restricted to AUT University students using institutional email addresses.

**Key Capabilities**:
- User registration with AUT email verification (@autuni.ac.nz)
- Secure login with JWT token-based authentication
- Email verification system
- Password reset functionality
- Profile management (view and update personal information)
- Role-based access control (Student/Admin)

**Security Measures**:
- bcrypt password hashing with salt rounds
- JWT token expiration and refresh
- Email verification required for full access
- Rate limiting on authentication endpoints

---

### 📚 2. Study Notes Sharing

**Description**: Comprehensive note-sharing platform where students can upload, browse, and download study materials for various courses.

**Key Capabilities**:
- Upload lecture notes, assignments, and study guides
- Browse notes by course, faculty, or semester
- Download notes as ZIP files for easy organization
- View note metadata (uploader, date, file size, course)
- Search and filter notes by multiple criteria
- Track your uploaded notes
- Admin moderation for quality control

**Supported File Types**:
- PDF documents
- Word documents (.doc, .docx)
- PowerPoint presentations (.ppt, .pptx)
- Images (screenshots, diagrams)
- Text files

**File Management**:
- Maximum file size: 10MB per upload
- Automatic ZIP compression for downloads
- Secure file storage with access control

---

### ⭐ 3. Course Reviews

**Description**: Transparent course review system allowing students to share detailed feedback about courses they've completed.

**Key Capabilities**:
- Write comprehensive course reviews
- Rate courses on multiple dimensions:
  - Overall rating (1-5 stars)
  - Difficulty level
  - Workload assessment
  - Teaching quality
- View aggregated ratings and reviews
- Filter reviews by course code, faculty, or semester
- Edit or delete your own reviews
- Anonymous review option
- Helpful/unhelpful voting on reviews

**Review Components**:
- Structured rating system
- Detailed written feedback
- Course metadata (code, name, semester taken)
- Timestamp and author information

---

### 👨‍🏫 4. Lecturer Feedback

**Description**: Anonymous feedback system for students to provide constructive feedback about lecturers and teaching methods.

**Key Capabilities**:
- Submit anonymous feedback for lecturers
- Rate lecturers on multiple criteria:
  - Teaching effectiveness
  - Communication skills
  - Availability and support
  - Course organization
- View aggregated lecturer ratings
- Browse feedback by lecturer or department
- Privacy-protected submission system
- Admin-only access to detailed feedback

**Privacy Features**:
- Complete anonymity for feedback submissions
- No user identification in feedback records
- Secure data handling
- Aggregated statistics only for public view

---

### 💬 5. Memorable Quotes

**Description**: Fun feature to share and discover memorable, inspiring, or humorous quotes from AUT lecturers.

**Key Capabilities**:
- Submit quotes with lecturer attribution
- Browse all quotes from the community
- Search quotes by lecturer or keyword
- Upvote favorite quotes
- Delete your own submissions
- View trending quotes

**Quote Format**:
- Quote text
- Lecturer name
- Course context (optional)
- Submission date
- Vote count

---

### 💰 6. Student Deals

**Description**: Community-driven platform for sharing exclusive student discounts, deals, and offers relevant to AUT students.

**Key Capabilities**:
- Post student deals and discounts
- Vote on deals (upvote/downvote)
- View deal popularity rankings
- Filter deals by category:
  - Food & Dining
  - Technology
  - Entertainment
  - Transportation
  - Education
- Include deal details:
  - Title and description
  - Discount percentage or amount
  - Validity period
  - Redemption instructions
  - External links
- Delete expired or invalid deals

**Deal Voting System**:
- Community-driven quality control
- Upvote helpful deals
- Downvote expired or misleading deals
- Sort by popularity or recency

---

### 💼 7. Jobs & Voluntary Work

**Description**: Job board for part-time work, internships, and voluntary opportunities suitable for students.

**Key Capabilities**:
- Post job opportunities
- Browse available positions
- Filter by job type:
  - Part-time jobs
  - Internships
  - Voluntary work
  - Campus jobs
- Vote on job postings
- Comment on job listings
- View job details:
  - Position title
  - Description
  - Requirements
  - Compensation (if applicable)
  - Contact information
  - Application deadline
- Delete your own job postings
- Manage job comments

**Commenting System**:
- Ask questions about positions
- Share experiences
- Provide additional information
- Delete your own comments

---

### 🎉 8. Campus Events

**Description**: Centralized event calendar for campus activities, workshops, social events, and academic seminars.

**Key Capabilities**:
- Create and post campus events
- Browse upcoming events
- Mark interest in events
- Subscribe to event notifications
- View event details:
  - Event name and description
  - Date and time
  - Location
  - Organizer information
  - Capacity limits
  - Registration requirements
- Track interested attendees
- Receive event reminders
- Unsubscribe from events
- Delete your own events

**Event Categories**:
- Academic workshops
- Social gatherings
- Career fairs
- Club activities
- Sports events
- Cultural celebrations

---

### 🤝 9. Community Q&A

**Description**: Forum-style question and answer platform for academic and campus-related queries.

**Key Capabilities**:
- Post questions to the community
- Reply to questions
- Browse questions by category or topic
- Search questions by keyword
- View question threads with all replies
- Delete your own questions and replies
- Track question activity
- Upvote helpful answers

**Question Categories**:
- Course-related queries
- Assignment help
- Campus facilities
- Administrative questions
- General advice

---

### 💬 10. Direct Messaging (Chat)

**Description**: Real-time one-on-one messaging system for private communication between students.

**Key Capabilities**:
- Send direct messages to friends
- Real-time message delivery
- Share file attachments (images, documents)
- Download attachments as ZIP files
- View conversation history
- Mark messages as read
- Unread message counter
- Search conversations
- Message timestamps

**File Sharing**:
- Attach files to messages
- Supported file types: images, PDFs, documents
- Maximum attachment size: 10MB
- Automatic ZIP compression for downloads
- Preview image attachments

**Chat Features**:
- Typing indicators
- Read receipts
- Message timestamps
- Conversation list with last message preview
- Unread message badges

---

### 👥 11. Group Chat

**Description**: Group messaging feature for collaborative discussions and team communication.

**Key Capabilities**:
- Create group chats
- Add multiple members to groups
- Send group messages
- Share files in groups
- View group members
- Leave groups
- Delete groups (creator only)
- Group message history
- Member management

**Group Management**:
- Set group name and description
- Add/remove members
- View member list
- Group admin controls
- Group notifications

---

### 🤝 12. Friend System

**Description**: Social networking feature to connect with fellow AUT students.

**Key Capabilities**:
- Send friend requests
- Accept or reject friend requests
- View friend list
- Remove friends
- View pending requests
- Search for students
- View friend profiles

**Friend Request Flow**:
1. Search for students by name or email
2. Send friend request
3. Recipient receives notification
4. Accept or reject request
5. Connected friends can chat

---

## 🛠️ Tech Stack

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 18.0+ |
| **TypeScript** | Type-safe development | 5.0+ |
| **Express.js** | Web application framework | 4.18+ |
| **PostgreSQL** | Relational database | 13+ |
| **JWT** | Authentication tokens | 9.0+ |
| **bcrypt** | Password hashing | 5.1+ |
| **Multer** | File upload handling | 1.4+ |
| **Nodemailer** | Email services | 6.9+ |
| **Archiver** | ZIP file creation | 6.0+ |

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | 14+ |
| **React** | UI library | 18+ |
| **TypeScript** | Type safety | 5.0+ |
| **Tailwind CSS** | Styling framework | 3.4+ |
| **Axios** | HTTP client | 1.6+ |
| **Lucide React** | Icon library | Latest |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Git** | Version control |
| **npm/yarn** | Package management |

---

## 🏗️ Project Architecture

### Directory Structure

\`\`\`
campus-connect-nz/
├── 📁 backend/                     # Express.js API Server
│   ├── 📁 src/
│   │   ├── 📄 app.ts              # Express application setup
│   │   ├── 📄 server.ts           # Server entry point
│   │   ├── 📁 config/             # Configuration files
│   │   │   ├── database.ts        # Database connection
│   │   │   └── email.ts           # Email configuration
│   │   ├── 📁 controllers/        # Route controllers
│   │   │   ├── authController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── reviewController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── jobController.ts
│   │   │   ├── dealController.ts
│   │   │   ├── eventController.ts
│   │   │   ├── communityController.ts
│   │   │   ├── groupChatController.ts
│   │   │   └── friendRequestController.ts
│   │   ├── 📁 middleware/         # Express middleware
│   │   │   ├── auth.ts            # Authentication
│   │   │   ├── upload.ts          # File uploads
│   │   │   ├── chatUpload.ts      # Chat attachments
│   │   │   └── validation.ts      # Input validation
│   │   ├── 📁 routes/             # API route definitions
│   │   │   ├── auth.ts
│   │   │   ├── notes.ts
│   │   │   ├── reviews.ts
│   │   │   ├── chat.ts
│   │   │   ├── jobs.ts
│   │   │   ├── deals.ts
│   │   │   ├── events.ts
│   │   │   ├── community.ts
│   │   │   ├── groups.ts
│   │   │   └── friendRequests.ts
│   │   ├── 📁 services/           # Business logic layer
│   │   │   └── emailService.ts
│   │   └── 📁 types/              # TypeScript definitions
│   │       └── index.ts
│   ├── 📁 scripts/                # Utility scripts
│   │   └── admin-management.js
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📁 frontend/                   # Next.js React Application
│   ├── 📁 src/
│   │   ├── 📁 app/                # Next.js app directory
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── notes/page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   ├── chat/page.tsx
│   │   │   ├── jobs/page.tsx
│   │   │   ├── deals/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── quotes/page.tsx
│   │   │   ├── lecturers/page.tsx
│   │   │   └── courses/page.tsx
│   │   ├── 📁 components/         # Reusable React components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── VotingButtons.tsx
│   │   │   └── dashboard/
│   │   │       └── CommunityPanel.tsx
│   │   ├── 📁 contexts/           # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   │   └── useRequireAuth.ts
│   │   ├── 📁 services/           # API service layer
│   │   │   └── api.ts
│   │   └── 📁 types/              # TypeScript definitions
│   │       └── index.ts
│   ├── 📁 public/                 # Static assets
│   │   ├── campus-icon.png
│   │   ├── background.jpg
│   │   └── default-profile.png
│   ├── 📄 package.json
│   ├── 📄 next.config.js
│   └── 📄 tailwind.config.js
│
├── 📁 database/                   # PostgreSQL Database
│   ├── 📁 migrations/             # Database migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_seed_data.sql
│   │   ├── 003_add_lecturers_quotes_and_update_feedback.sql
│   │   ├── 003_deals_schema.sql
│   │   ├── 004_jobs_schema.sql
│   │   ├── 005_events_schema.sql
│   │   ├── 006_community_questions_schema.sql
│   │   ├── 007_event_subscriptions.sql
│   │   ├── 008_add_chat_tables.sql
│   │   ├── 009_add_group_chat_tables.sql
│   │   ├── 010_add_chat_attachments.sql
│   │   └── 011_allow_null_message_content.sql
│   ├── 📁 scripts/                # Database scripts
│   │   ├── create_admin_user.sql
│   │   ├── grant_*_permissions.sql
│   │   └── run-migration.js
│   ├── 📁 queries/                # Common SQL queries
│   │   └── common_queries.sql
│   ├── 📄 schema.sql              # Complete database schema
│   └── 📄 seeds.sql               # Initial seed data
│
└── 📄 README.md                   # This file
\`\`\`

### Architecture Patterns

**Backend Architecture**:
- **MVC Pattern**: Model-View-Controller separation
- **Middleware Pipeline**: Request processing chain
- **Service Layer**: Business logic abstraction
- **Repository Pattern**: Database access abstraction

**Frontend Architecture**:
- **Component-Based**: Reusable React components
- **Context API**: Global state management
- **Custom Hooks**: Reusable logic
- **API Service Layer**: Centralized API calls

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- [ ] **Node.js** (version 18.0.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- [ ] **npm** or **yarn** (package manager)
  - npm comes with Node.js
  - Verify installation: `npm --version`

- [ ] **PostgreSQL** (version 13.0 or higher)
  - Download from: https://www.postgresql.org/download/
  - Verify installation: `psql --version`

- [ ] **Git** (version control)
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

### Optional Tools

- **pgAdmin** or **DBeaver** (database management GUI)
- **Postman** or **Insomnia** (API testing)
- **VS Code** (recommended code editor)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/campus-connect-nz.git

# Navigate to project directory
cd campus-connect-nz
\`\`\`

### Step 2: Database Setup

#### 2.1 Create PostgreSQL Database

\`\`\`bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Or on Windows:
psql -U postgres
\`\`\`

\`\`\`sql
-- Create database
CREATE DATABASE campus_connect_nz;

-- Create user with password
CREATE USER campus_connect WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campus_connect_nz TO campus_connect;

-- Connect to the database
\c campus_connect_nz

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO campus_connect;

-- Exit psql
\q
\`\`\`

#### 2.2 Run Database Migrations

\`\`\`bash
# Navigate to database directory
cd database

# Run migrations in order
psql -U campus_connect -d campus_connect_nz -f migrations/001_initial_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/002_seed_data.sql
psql -U campus_connect -d campus_connect_nz -f migrations/003_add_lecturers_quotes_and_update_feedback.sql
psql -U campus_connect -d campus_connect_nz -f migrations/003_deals_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/004_jobs_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/005_events_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/006_community_questions_schema.sql
psql -U campus_connect -d campus_connect_nz -f migrations/007_event_subscriptions.sql
psql -U campus_connect -d campus_connect_nz -f migrations/008_add_chat_tables.sql
psql -U campus_connect -d campus_connect_nz -f migrations/009_add_group_chat_tables.sql
psql -U campus_connect -d campus_connect_nz -f migrations/010_add_chat_attachments.sql
psql -U campus_connect -d campus_connect_nz -f migrations/011_allow_null_message_content.sql

# Run permission scripts
psql -U campus_connect -d campus_connect_nz -f scripts/grant_jobs_permissions.sql
psql -U campus_connect -d campus_connect_nz -f scripts/grant_chat_permissions.sql
psql -U campus_connect -d campus_connect_nz -f scripts/grant_community_permissions.sql
psql -U campus_connect -d campus_connect_nz -f scripts/grant_event_subscriptions_permissions.sql
psql -U campus_connect -d campus_connect_nz -f scripts/grant_chat_attachments_permissions.sql
psql -U campus_connect -d campus_connect_nz -f scripts/grant_group_chat_permissions.sql

# Create admin user (optional)
psql -U campus_connect -d campus_connect_nz -f scripts/create_admin_user.sql
\`\`\`

### Step 3: Backend Setup

\`\`\`bash
# Navigate to backend directory
cd ../backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
\`\`\`

#### 3.1 Configure Backend Environment Variables

Edit the `.env` file with your configuration:

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
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
FROM_EMAIL=noreply@campusconnectnz.com
FROM_NAME=Campus Connect NZ

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

**Important Notes**:
- For Gmail SMTP, you need to generate an App Password (not your regular password)
- Generate a strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Adjust file size limits based on your needs

#### 3.2 Start Backend Server

\`\`\`bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
\`\`\`

The backend server will start on `http://localhost:3001`

### Step 4: Frontend Setup

\`\`\`bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
\`\`\`

#### 4.1 Configure Frontend Environment Variables

Edit the `.env.local` file:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
\`\`\`

#### 4.2 Start Frontend Server

\`\`\`bash
# Development mode
npm run dev

# Production build
npm run build
npm start
\`\`\`

The frontend application will start on `http://localhost:3000`

### Step 5: Verify Installation

1. **Backend Health Check**:
   - Open browser: `http://localhost:3001/api/health`
   - Should return: `{"status": "ok"}`

2. **Frontend Access**:
   - Open browser: `http://localhost:3000`
   - You should see the Campus Connect landing page

3. **Database Connection**:
   \`\`\`bash
   psql -U campus_connect -d campus_connect_nz -c "SELECT COUNT(*) FROM users;"
   \`\`\`

### Step 6: Create Test Account

1. Navigate to `http://localhost:3000/signup`
2. Register with an AUT email address (@autuni.ac.nz)
3. Check your email for verification link
4. Verify your account
5. Login at `http://localhost:3000/login`

---

## 📖 How to Use Each Feature

### 1. Getting Started

#### Registration & Login

**To Register**:
1. Navigate to the signup page
2. Fill in your details:
   - First Name
   - Last Name
   - AUT Email (@autuni.ac.nz)
   - Password (minimum 8 characters)
3. Click "Sign Up"
4. Check your email for verification link
5. Click the verification link
6. Your account is now active

**To Login**:
1. Navigate to the login page
2. Enter your AUT email and password
3. Click "Login"
4. You'll be redirected to the dashboard

**Password Reset**:
1. Click "Forgot Password" on login page
2. Enter your AUT email
3. Check your email for reset link
4. Click the link and enter new password
5. Login with new password

---

### 2. Using Study Notes

#### Uploading Notes

1. Navigate to **Notes** page from the dashboard
2. Click **"Upload Note"** button
3. Fill in the form:
   - **Title**: Descriptive name for your notes
   - **Description**: Brief overview of content
   - **Course**: Select the course from dropdown
   - **File**: Choose file to upload (PDF, DOCX, PPT, etc.)
4. Click **"Upload"**
5. Your note will be available to all students

#### Browsing & Downloading Notes

1. Go to **Notes** page
2. Use filters to find notes:
   - Search by title or description
   - Filter by course
   - Filter by faculty
   - Sort by date or popularity
3. Click on a note card to view details
4. Click **"Download"** button
5. Note will download as a ZIP file
6. Extract the ZIP to access the original file

#### Managing Your Notes

1. Navigate to **My Notes** section
2. View all notes you've uploaded
3. Click **"Delete"** to remove a note
4. Confirm deletion

---

### 3. Writing Course Reviews

#### Creating a Review

1. Navigate to **Reviews** page
2. Click **"Write Review"** button
3. Fill in the review form:
   - **Course**: Select from dropdown
   - **Overall Rating**: 1-5 stars
   - **Difficulty**: Easy, Medium, Hard, Very Hard
   - **Workload**: Light, Moderate, Heavy, Very Heavy
   - **Review Text**: Detailed feedback (minimum 50 characters)
   - **Semester Taken**: When you took the course
   - **Would Recommend**: Yes/No
4. Click **"Submit Review"**

#### Viewing Reviews

1. Go to **Reviews** page
2. Browse all reviews or filter by:
   - Course code
   - Faculty
   - Rating
   - Semester
3. Read detailed reviews
4. View aggregated statistics:
   - Average rating
   - Difficulty distribution
   - Workload distribution

#### Managing Your Reviews

1. Navigate to **My Reviews**
2. View all your submitted reviews
3. Click **"Edit"** to modify a review
4. Click **"Delete"** to remove a review

---

### 4. Submitting Lecturer Feedback

#### Providing Feedback

1. Navigate to **Lecturer Feedback** page
2. Click **"Submit Feedback"** button
3. Select lecturer from dropdown
4. Rate on multiple criteria (1-5 stars):
   - Teaching Effectiveness
   - Communication Skills
   - Availability & Support
   - Course Organization
5. Write detailed feedback (optional but encouraged)
6. Click **"Submit"** (submission is anonymous)

#### Viewing Lecturer Ratings

1. Go to **Lecturers** page
2. Browse lecturer profiles
3. View aggregated ratings:
   - Overall rating
   - Individual criterion ratings
   - Number of reviews
4. Read anonymous feedback comments

---

### 5. Sharing Quotes

#### Posting a Quote

1. Navigate to **Quotes** page
2. Click **"Add Quote"** button
3. Fill in the form:
   - **Quote Text**: The memorable quote
   - **Lecturer Name**: Who said it
   - **Course Context**: Where it was said (optional)
4. Click **"Submit"**

#### Browsing Quotes

1. Go to **Quotes** page
2. Browse all quotes
3. Search by lecturer name or keyword
4. Upvote your favorite quotes
5. View trending quotes

---

### 6. Finding Student Deals

#### Posting a Deal

1. Navigate to **Deals** page
2. Click **"Post Deal"** button
3. Fill in the deal form:
   - **Title**: Deal name
   - **Description**: Details about the deal
   - **Category**: Select category
   - **Discount**: Percentage or amount
   - **Valid Until**: Expiration date
   - **Link**: External link (optional)
   - **Redemption Instructions**: How to use the deal
4. Click **"Post Deal"**

#### Using Deals

1. Go to **Deals** page
2. Browse available deals
3. Filter by category
4. Sort by:
   - Most popular (upvotes)
   - Newest
   - Expiring soon
5. Click on a deal to view full details
6. Upvote helpful deals
7. Downvote expired or misleading deals
8. Click external link to redeem

---

### 7. Exploring Jobs & Opportunities

#### Posting a Job

1. Navigate to **Jobs/Voluntary** page
2. Click **"Post Opportunity"** button
3. Fill in the form:
   - **Title**: Position name
   - **Type**: Part-time, Internship, Voluntary, Campus Job
   - **Description**: Job details and requirements
   - **Compensation**: Salary/stipend (if applicable)
   - **Contact**: How to apply
   - **Deadline**: Application deadline
4. Click **"Post"**

#### Browsing Jobs

1. Go to **Jobs/Voluntary** page
2. Filter by job type
3. Sort by date or popularity
4. Click on a job to view full details
5. Read comments from other students
6. Upvote relevant opportunities

#### Commenting on Jobs

1. Open a job posting
2. Scroll to comments section
3. Click **"Add Comment"**
4. Write your question or feedback
5. Click **"Submit"**
6. View replies from others

---

### 8. Discovering Campus Events

#### Creating an Event

1. Navigate to **Events** page
2. Click **"Create Event"** button
3. Fill in the event form:
   - **Event Name**: Title of the event
   - **Description**: Event details
   - **Date & Time**: When it's happening
   - **Location**: Where it's happening
   - **Category**: Type of event
   - **Capacity**: Maximum attendees (optional)
   - **Registration Required**: Yes/No
4. Click **"Create Event"**

#### Attending Events

1. Go to **Events** page
2. Browse upcoming events
3. Filter by:
   - Date range
   - Category
   - Location
4. Click on an event to view details
5. Click **"I'm Interested"** to mark interest
6. Click **"Subscribe"** to receive notifications
7. View list of interested attendees

#### Managing Event Subscriptions

1. Navigate to **My Events**
2. View events you're subscribed to
3. Click **"Unsubscribe"** to stop notifications
4. Receive email reminders before events

---

### 9. Participating in Community Q&A

#### Asking a Question

1. Navigate to **Community** page (or Dashboard)
2. Click **"Ask Question"** button
3. Fill in the form:
   - **Title**: Clear, concise question
   - **Description**: Detailed explanation
   - **Category**: Select relevant category
   - **Tags**: Add relevant tags (optional)
4. Click **"Post Question"**

#### Answering Questions

1. Browse questions on Community page
2. Click on a question to view details
3. Read existing replies
4. Click **"Reply"** button
5. Write your answer
6. Click **"Submit Reply"**

#### Managing Your Posts

1. View your questions and replies
2. Click **"Delete"** to remove your posts
3. Edit questions if needed

---

### 10. Using Direct Messaging

#### Adding Friends

1. Navigate to **Friends** section
2. Click **"Add Friend"** button
3. Search for student by name or email
4. Click **"Send Request"**
5. Wait for acceptance

#### Managing Friend Requests

1. Go to **Friend Requests** page
2. View pending requests
3. Click **"Accept"** or **"Reject"**
4. View your friends list

#### Chatting with Friends

1. Navigate to **Chat** page
2. View your conversations list
3. Click on a friend to open chat
4. Type your message in the input box
5. Press Enter or click Send

#### Sending File Attachments

1. Open a chat conversation
2. Click the **attachment icon** (📎)
3. Select file from your computer
4. File will upload and send automatically
5. Recipient can download the file

#### Downloading Chat Attachments

1. View message with attachment
2. Click on the attachment
3. File will download as a ZIP file
4. Extract ZIP to access the original file

---

### 11. Creating Group Chats

#### Starting a Group

1. Navigate to **Chat** page
2. Click **"Create Group"** button
3. Fill in group details:
   - **Group Name**: Name for the group
   - **Description**: Purpose of the group (optional)
4. Select members from your friends list
5. Click **"Create Group"**

#### Using Group Chat

1. Go to **Chat** page
2. Select a group from conversations list
3. Send messages to the group
4. Share files with all members
5. View group members

#### Managing Groups

1. Open a group chat
2. Click **"Group Info"** or settings icon
3. Options:
   - **Add Members**: Invite more friends
   - **View Members**: See all participants
   - **Leave Group**: Exit the group
   - **Delete Group**: Remove group (creator only)

---

### 12. Managing Your Profile

#### Viewing Profile

1. Click on your profile icon/name
2. Select **"Profile"** from dropdown
3. View your information:
   - Name
   - Email
   - Join date
   - Verification status

#### Updating Profile

1. Go to Profile page
2. Click **"Edit Profile"** button
3. Update information:
   - First Name
   - Last Name
   - Profile picture (if implemented)
4. Click **"Save Changes"**

---

## 📚 API Documentation

### Base URL

\`\`\`
Development: http://localhost:3001/api
Production: https://your-domain.com/api
\`\`\`

### Authentication

Most endpoints require authentication. Include JWT token in request headers:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### API Endpoints

#### Authentication Endpoints

\`\`\`http
POST   /api/auth/signup              # User registration
POST   /api/auth/login               # User login
POST   /api/auth/verify              # Email verification
POST   /api/auth/request-reset       # Request password reset
POST   /api/auth/reset-password      # Reset password
GET    /api/auth/profile             # Get user profile (requires auth)
PUT    /api/auth/profile             # Update profile (requires auth)
\`\`\`

#### Notes Endpoints

\`\`\`http
GET    /api/notes                    # Get all notes
POST   /api/notes                    # Upload note (requires auth)
GET    /api/notes/download/:id       # Download note as ZIP
GET    /api/notes/my-notes           # Get user's notes (requires auth)
DELETE /api/notes/:id                # Delete note (requires auth)
GET    /api/notes/admin/all          # Admin: Get all notes
\`\`\`

#### Reviews Endpoints

\`\`\`http
GET    /api/reviews                  # Get all reviews
POST   /api/reviews                  # Create review (requires auth)
GET    /api/reviews/my-reviews       # Get user's reviews (requires auth)
DELETE /api/reviews/:id              # Delete review (requires auth)
\`\`\`

#### Lecturer Feedback Endpoints

\`\`\`http
GET    /api/lecturer-feedback        # Get all feedback
POST   /api/lecturer-feedback        # Submit feedback (requires auth)
GET    /api/lecturer-feedback/my-feedback  # Get user's feedback (requires auth)
DELETE /api/lecturer-feedback/:id    # Delete feedback (requires auth)
\`\`\`

#### Lecturers Endpoints

\`\`\`http
GET    /api/lecturers                # Get all lecturers
GET    /api/lecturers/:id            # Get specific lecturer
POST   /api/lecturers                # Create lecturer (admin only)
PUT    /api/lecturers/:id            # Update lecturer (admin only)
DELETE /api/lecturers/:id            # Delete lecturer (admin only)
\`\`\`

#### Quotes Endpoints

\`\`\`http
GET    /api/quotes                   # Get all quotes
POST   /api/quotes                   # Create quote (requires auth)
DELETE /api/quotes/:id               # Delete quote (requires auth)
\`\`\`

#### Deals Endpoints

\`\`\`http
GET    /api/deals                    # Get all deals
POST   /api/deals                    # Create deal (requires auth)
POST   /api/deals/:id/vote           # Vote on deal (requires auth)
DELETE /api/deals/:id                # Delete deal (requires auth)
\`\`\`

#### Jobs Endpoints

\`\`\`http
GET    /api/jobs                     # Get all jobs
POST   /api/jobs                     # Create job (requires auth)
POST   /api/jobs/:id/vote            # Vote on job (requires auth)
DELETE /api/jobs/:id                 # Delete job (requires auth)
GET    /api/jobs/:id/comments        # Get job comments
POST   /api/jobs/:id/comments        # Add comment (requires auth)
DELETE /api/jobs/comments/:commentId # Delete comment (requires auth)
\`\`\`

#### Events Endpoints

\`\`\`http
GET    /api/events                   # Get all events
POST   /api/events                   # Create event (requires auth)
POST   /api/events/:id/interest      # Mark interest (requires auth)
POST   /api/events/:id/subscribe     # Subscribe to event (requires auth)
DELETE /api/events/:id/subscribe     # Unsubscribe (requires auth)
DELETE /api/events/:id               # Delete event (requires auth)
\`\`\`

#### Community Endpoints

\`\`\`http
GET    /api/community/questions      # Get all questions
POST   /api/community/questions      # Post question (requires auth)
DELETE /api/community/questions/:id  # Delete question (requires auth)
GET    /api/community/questions/:id/replies  # Get replies
POST   /api/community/questions/:id/replies  # Post reply (requires auth)
DELETE /api/community/replies/:replyId       # Delete reply (requires auth)
\`\`\`

#### Chat Endpoints

\`\`\`http
POST   /api/chat/messages            # Send message (requires auth)
GET    /api/chat/conversations       # Get all conversations (requires auth)
GET    /api/chat/conversations/:friendId  # Get conversation (requires auth)
POST   /api/chat/conversations/:friendId/read  # Mark as read (requires auth)
GET    /api/chat/unread-count        # Get unread count (requires auth)
GET    /api/chat/attachments/:messageId  # Download attachment as ZIP
\`\`\`

#### Group Chat Endpoints

\`\`\`http
POST   /api/groups/create            # Create group (requires auth)
GET    /api/groups                   # Get user's groups (requires auth)
POST   /api/groups/message           # Send group message (requires auth)
GET    /api/groups/:groupId/messages # Get group messages (requires auth)
GET    /api/groups/:groupId/members  # Get group members (requires auth)
POST   /api/groups/:groupId/members  # Add members (requires auth)
DELETE /api/groups/:groupId/leave    # Leave group (requires auth)
DELETE /api/groups/:groupId          # Delete group (requires auth)
\`\`\`

#### Friend Request Endpoints

\`\`\`http
POST   /api/friend-requests          # Send friend request (requires auth)
GET    /api/friend-requests          # Get pending requests (requires auth)
POST   /api/friend-requests/:requestId/accept  # Accept request (requires auth)
POST   /api/friend-requests/:requestId/reject  # Reject request (requires auth)
GET    /api/friend-requests/friends  # Get friends list (requires auth)
DELETE /api/friend-requests/friends/:friendId  # Remove friend (requires auth)
\`\`\`

#### Courses Endpoints

\`\`\`http
GET    /api/courses                  # Get all courses
GET    /api/courses/:id              # Get specific course
POST   /api/courses                  # Create course (requires auth)
DELETE /api/courses/:id              # Delete course (requires auth)
\`\`\`

### Request/Response Examples

#### Example: User Registration

**Request**:
\`\`\`http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "student@autuni.ac.nz",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": 123
}
\`\`\`

#### Example: Upload Note

**Request**:
\`\`\`http
POST /api/notes
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "COMP101 Lecture Notes Week 1",
  "description": "Introduction to Programming concepts",
  "courseId": 5,
  "file": <binary_file_data>
}
\`\`\`

**Response**:
\`\`\`json
{
  "message": "Note uploaded successfully",
  "note": {
    "id": 456,
    "title": "COMP101 Lecture Notes Week 1",
    "description": "Introduction to Programming concepts",
    "courseId": 5,
    "fileName": "comp101_week1.pdf",
    "fileSize": 2048576,
    "uploadedBy": 123,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
\`\`\`

---

## 🗄️ Database Schema

### Entity Relationship Overview

The database consists of the following main entities:

1. **Users** - Student accounts
2. **Courses** - Academic courses
3. **Notes** - Study materials
4. **Reviews** - Course reviews
5. **Lecturers** - Faculty members
6. **Lecturer Feedback** - Anonymous feedback
7. **Quotes** - Memorable quotes
8. **Deals** - Student deals
9. **Jobs** - Job opportunities
10. **Events** - Campus events
11. **Community Questions** - Q&A posts
12. **Community Replies** - Answers to questions
13. **Chat Messages** - Direct messages
14. **Chat Attachments** - File attachments
15. **Group Chats** - Group conversations
16. **Group Messages** - Group chat messages
17. **Friend Requests** - Friend connections

### Core Tables

#### Users Table

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'student',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Courses Table

\`\`\`sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  semester VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Notes Table

\`\`\`sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Reviews Table

\`\`\`sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  difficulty VARCHAR(20),
  workload VARCHAR(20),
  review_text TEXT NOT NULL,
  semester_taken VARCHAR(20),
  would_recommend BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Chat Messages Table

\`\`\`sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Chat Attachments Table

\`\`\`sql
CREATE TABLE chat_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Database Relationships

- **Users → Notes**: One-to-Many (A user can upload many notes)
- **Users → Reviews**: One-to-Many (A user can write many reviews)
- **Users → Chat Messages**: One-to-Many (A user can send many messages)
- **Courses → Notes**: One-to-Many (A course can have many notes)
- **Courses → Reviews**: One-to-Many (A course can have many reviews)
- **Chat Messages → Attachments**: One-to-Many (A message can have multiple attachments)
- **Users ↔ Users**: Many-to-Many (Friend relationships)

---

## 🔒 Security Features

### Authentication Security

1. **Password Security**:
   - bcrypt hashing with configurable salt rounds
   - Minimum password length enforcement
   - Password complexity requirements

2. **JWT Tokens**:
   - Secure token generation
   - Configurable expiration times
   - Token refresh mechanism
   - Secure token storage

3. **Email Verification**:
   - Required AUT email domain (@autuni.ac.nz)
   - Verification token system
   - Account activation workflow

### Data Protection

1. **Input Validation**:
   - Server-side validation for all inputs
   - SQL injection prevention
   - XSS attack prevention
   - File upload validation

2. **File Security**:
   - File type restrictions
   - File size limits
   - Secure file storage
   - Access control for downloads

3. **Database Security**:
   - Parameterized queries
   - Role-based access control
   - Connection pooling
   - Encrypted connections

### Privacy Features

1. **Anonymous Feedback**:
   - No user identification in lecturer feedback
   - Aggregated statistics only
   - Privacy-protected submissions

2. **Data Access Control**:
   - Users can only modify their own content
   - Admin-only endpoints protected
   - Friend-only chat access

### API Security

1. **Rate Limiting**:
   - Request throttling
   - Configurable limits
   - IP-based tracking

2. **CORS Configuration**:
   - Restricted origins
   - Secure headers
   - Credential handling

---

## 🧪 Testing

### Running Tests

#### Backend Tests

\`\`\`bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- authController.test.ts

# Run tests in watch mode
npm run test:watch
\`\`\`

#### Frontend Tests

\`\`\`bash
cd frontend

# Run component tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
\`\`\`

### Test Coverage

The project aims for:
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key user flows
- **E2E Tests**: Critical paths

### Manual Testing Checklist

- [ ] User registration and email verification
- [ ] Login and authentication
- [ ] Password reset flow
- [ ] Note upload and download
- [ ] Course review submission
- [ ] Lecturer feedback submission
- [ ] Chat messaging and file attachments
- [ ] Group chat creation and messaging
- [ ] Friend request workflow
- [ ] Deal voting system
- [ ] Job posting and commenting
- [ ] Event creation and subscription
- [ ] Community Q&A posting

---

## 🚀 Deployment

### Production Deployment

#### Option 1: Docker Deployment (Recommended)

\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

#### Option 2: Manual Deployment

**Backend Deployment**:

\`\`\`bash
cd backend

# Install production dependencies
npm ci --production

# Build TypeScript
npm run build

# Start production server
NODE_ENV=production npm start
\`\`\`

**Frontend Deployment**:

\`\`\`bash
cd frontend

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### Environment Configuration

**Production Environment Variables**:

\`\`\`env
NODE_ENV=production
PORT=3001
DB_HOST=your_production_db_host
DB_NAME=campus_connect_nz
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-domain.com
\`\`\`

### Deployment Platforms

**Recommended Platforms**:
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Heroku Postgres, Supabase, Railway

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
\`\`\`bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify connection
psql -U campus_connect -d campus_connect_nz -c "SELECT 1;"

# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME
\`\`\`

#### Port Already in Use

**Problem**: Port 3000 or 3001 already in use

**Solutions**:
\`\`\`bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env file
PORT=3002
\`\`\`

#### Email Sending Fails

**Problem**: Email verification not working

**Solutions**:
1. Check SMTP credentials in `.env`
2. For Gmail, enable "Less secure app access" or use App Password
3. Verify SMTP_HOST and SMTP_PORT
4. Check firewall settings

#### File Upload Errors

**Problem**: Cannot upload files

**Solutions**:
1. Check `UPLOAD_DIR` exists and has write permissions:
   \`\`\`bash
   mkdir -p backend/uploads
   chmod 755 backend/uploads
   \`\`\`
2. Verify `MAX_FILE_SIZE` in `.env`
3. Check `ALLOWED_FILE_TYPES` configuration

#### JWT Token Errors

**Problem**: Authentication fails or tokens expire immediately

**Solutions**:
1. Verify `JWT_SECRET` is set and consistent
2. Check `JWT_EXPIRES_IN` value
3. Clear browser cookies and localStorage
4. Regenerate JWT_SECRET if compromised

### Debug Mode

Enable detailed logging:

\`\`\`env
NODE_ENV=development
DEBUG=campus-connect:*
LOG_LEVEL=debug
\`\`\`

### Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review error logs in console
3. Check database logs
4. Verify environment variables
5. Consult project documentation
6. Contact project team

---

## 👥 Project Team

### Development Team

**Project Lead**: [Your Name]
- Email: your.email@autuni.ac.nz
- GitHub: [@yourusername](https://github.com/yourusername)

**Backend Developer**: [Team Member Name]
- Email: member@autuni.ac.nz

**Frontend Developer**: [Team Member Name]
- Email: member@autuni.ac.nz

**Database Administrator**: [Team Member Name]
- Email: member@autuni.ac.nz

### Academic Supervisor

**Course Instructor**: [Instructor Name]
- Department: Software Development
- Institution: AUT University

### Acknowledgments

- AUT University for project support
- Course instructors for guidance
- Beta testers from AUT student community
- Open-source libraries and frameworks used

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

\`\`\`
Copyright (c) 2025 Campus Connect NZ Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
\`\`\`

---

## 📞 Contact & Support

### Project Repository

- **GitHub**: [https://github.com/yourusername/campus-connect-nz](https://github.com/yourusername/campus-connect-nz)
- **Issues**: [Report bugs or request features](https://github.com/yourusername/campus-connect-nz/issues)
- **Discussions**: [Community discussions](https://github.com/yourusername/campus-connect-nz/discussions)

### Support Channels

- **Email**: support@campusconnectnz.com
- **Documentation**: [Project Wiki](https://github.com/yourusername/campus-connect-nz/wiki)

---

## 🗺️ Roadmap

### Future Enhancements

**Phase 1** (Current):
- ✅ Core authentication system
- ✅ Notes sharing with ZIP downloads
- ✅ Course reviews
- ✅ Lecturer feedback
- ✅ Direct messaging with file attachments
- ✅ Group chat functionality
- ✅ Community Q&A
- ✅ Events and deals

**Phase 2** (Planned):
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced search with filters
- [ ] Study group formation
- [ ] Calendar integration
- [ ] Video/audio chat
- [ ] AI-powered study recommendations

**Phase 3** (Future):
- [ ] Integration with AUT systems
- [ ] Gamification and achievements
- [ ] Marketplace for textbooks
- [ ] Tutoring connections
- [ ] Career services integration

---

<div align="center">

## 🎓 Built for AUT Students, by AUT Students

**Campus Connect NZ** - Empowering Academic Excellence Through Collaboration

---

**Made with ❤️ at AUT University**

[⭐ Star this repo](https://github.com/yourusername/campus-connect-nz) • [🐛 Report Bug](https://github.com/yourusername/campus-connect-nz/issues) • [💡 Request Feature](https://github.com/yourusername/campus-connect-nz/issues) • [📖 Documentation](https://github.com/yourusername/campus-connect-nz/wiki)

---

*This project was developed as part of the Software Development course at AUT University.*

</div>

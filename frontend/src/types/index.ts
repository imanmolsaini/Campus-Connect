// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  role: 'student' | 'admin';
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Course types
export interface Course {
  id: string;
  name: string;
  code: string;
  faculty: 'business' | 'design_creative' | 'engineering_computer_mathematical' | 'health_environmental' | 'maori_indigenous';
  year: number;
  description?: string;
  credits: number;
  review_count: number;
  avg_rating: number;
  avg_difficulty: number;
  avg_workload: number;
  created_at: string;
  updated_at: string;
}

// Note types
export interface Note {
  id: string;
  uploader_id: string;
  course_code: string;
  title: string;
  type: 'lecture_notes' | 'assignment' | 'exam_prep' | 'tutorial' | 'other';
  file_path: string;
  file_size?: number;
  description?: string;
  download_count: number;
  approved: boolean;
  uploader_name: string;
  course_name: string;
  created_at: string;
  updated_at: string;
}

// Review types
export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  difficulty_rating?: number;
  workload_rating?: number;
  would_recommend?: boolean;
  reviewer_name: string;
  course_name: string;
  course_code: string;
  created_at: string;
  updated_at: string;
}

// Lecturer types (NEW)
export interface Lecturer {
  id: string;
  name: string;
  profile_image_url?: string;
  description?: string;
  feedback_count: number;
  avg_feedback_rating: number;
  quote_count: number;
  created_at: string;
  updated_at: string;
}

// Lecturer feedback types (MODIFIED)
export interface LecturerFeedback {
  id: string;
  lecturer_id?: string;
  lecturer_name?: string; // Can be from DB or derived from lecturer_id
  course_id?: string;
  user_id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  teaching_quality?: number;
  communication_rating?: number;
  availability_rating?: number;
  reviewer_name: string; // From join
  course_name?: string; // From join
  course_code?: string; // From join
  created_at: string;
  updated_at: string;
}

// Quote types (NEW)
export interface Quote {
  id: string;
  lecturer_id: string;
  user_id: string;
  quote_text: string;
  context?: string;
  lecturer_name: string; // From join
  profile_image_url?: string; // From join
  uploader_name: string; // From join
  created_at: string;
  updated_at: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export interface NoteUploadForm {
  course_code: string;
  title: string;
  type: 'lecture_notes' | 'assignment' | 'exam_prep' | 'tutorial' | 'other';
  description?: string;
  file: File;
}

export interface ReviewForm {
  course_id: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  difficulty_rating?: number;
  workload_rating?: number;
  would_recommend?: boolean;
}

// Lecturer feedback form (MODIFIED)
export interface LecturerFeedbackForm {
  lecturer_id?: string;
  lecturer_name?: string;
  course_id?: string;
  rating: number;
  comment?: string;
  anonymous: boolean;
  teaching_quality?: number;
  communication_rating?: number;
  availability_rating?: number;
}

// Lecturer form (NEW)
export interface LecturerForm {
  name: string;
  profile_image_url?: string;
  description?: string;
}

// Quote form (NEW)
export interface QuoteForm {
  lecturer_id: string;
  quote_text: string;
  context?: string;
}

// User types
export interface User {
  id: string
  name: string
  email: string
  verified: boolean
  role: "student" | "admin"
  created_at: string
  updated_at: string
}

// Course types
export interface Course {
  id: string
  name: string
  code: string
  faculty:
    | "business"
    | "design_creative"
    | "engineering_computer_mathematical"
    | "health_environmental"
    | "maori_indigenous"
  year: number
  description?: string
  credits: number
  created_at: string
  updated_at: string
  // Additional fields from aggregations
  avg_rating?: number
  review_count?: number
  note_count?: number
}

// Note types
export interface Note {
  id: string
  uploader_id: string
  uploader_name?: string
  course_code: string
  title: string
  type: "lecture_notes" | "assignment" | "exam_prep" | "tutorial" | "other"
  file_path: string
  file_size?: number
  description?: string
  download_count: number
  approved: boolean
  created_at: string
  updated_at: string
}

// Review types
export interface Review {
  id: string
  course_id: string
  course_name?: string
  course_code?: string
  user_id: string
  user_name?: string
  rating: number
  comment?: string
  anonymous: boolean
  difficulty_rating?: number
  workload_rating?: number
  would_recommend?: boolean
  created_at: string
  updated_at: string
}

// Lecturer types
export interface Lecturer {
  id: string
  name: string
  profile_image_url?: string
  description?: string
  created_at: string
  updated_at: string
  // Additional fields from aggregations
  avg_rating?: number
  feedback_count?: number
  quote_count?: number
}

// Lecturer feedback types
export interface LecturerFeedback {
  id: string
  lecturer_id?: string
  lecturer_name?: string
  course_id?: string
  course_name?: string
  course_code?: string
  user_id: string
  user_name?: string
  rating: number
  comment?: string
  anonymous?: boolean
  teaching_quality?: number
  communication_rating?: number
  availability_rating?: number
  created_at: string
  updated_at: string
}

// Quote types
export interface Quote {
  id: string
  lecturer_id: string
  lecturer_name?: string
  profile_image_url?: string
  user_id: string
  uploader_name?: string
  quote_text: string
  context?: string
  created_at: string
  updated_at: string
}

// Deal types
export interface Deal {
  id: string
  user_id: string
  uploader_name?: string
  title: string
  description?: string
  original_price?: number
  deal_price?: number
  discount_percentage?: number
  website_url?: string
  website_name?: string
  category: string
  image_url?: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Additional fields from joins
  upvotes?: number
  downvotes?: number
  user_vote?: "up" | "down"
}

// Job types
export interface Job {
  id: string
  user_id: string
  uploader_name?: string
  title: string
  job_type: "part-time" | "full-time" | "casual" | "voluntary"
  pay_rate?: string
  pay_type?: "hourly" | "weekly" | "fixed" | "unpaid"
  description?: string
  location: string
  contact_info: string
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Additional fields from joins
  upvotes?: number
  downvotes?: number
  user_vote?: "up" | "down"
  comment_count?: number
  is_expired?: boolean
}

// Job comment types
export interface JobComment {
  id: string
  job_id: string
  user_id: string
  user_name?: string
  comment_text: string
  created_at: string
  updated_at: string
}

// Form types
export interface SignupForm {
  name: string
  email: string
  password: string
}

export interface LoginForm {
  email: string
  password: string
}

export interface NoteUploadForm {
  course_code: string
  title: string
  type: "lecture_notes" | "assignment" | "exam_prep" | "tutorial" | "other"
  description?: string
  file: FileList
}

export interface ReviewForm {
  course_id: string
  rating: number
  comment?: string
  anonymous?: boolean
  difficulty_rating?: number
  workload_rating?: number
  would_recommend?: boolean
}

export interface LecturerForm {
  name: string
  profile_image_url?: string
  description?: string
}

export interface LecturerFeedbackForm {
  lecturer_id?: string
  lecturer_name?: string
  course_id?: string
  rating: number
  comment?: string
  anonymous?: boolean
  teaching_quality?: number
  communication_rating?: number
  availability_rating?: number
}

export interface QuoteForm {
  lecturer_id: string
  quote_text: string
  context?: string
}

export interface DealForm {
  title: string
  description?: string
  original_price?: string
  deal_price?: string
  website_url?: string
  website_name?: string
  category?: string
  image_url?: string
  expires_at?: string
}

export interface JobForm {
  title: string
  job_type: "part-time" | "full-time" | "casual" | "voluntary"
  pay_rate?: string
  pay_type?: "hourly" | "weekly" | "fixed" | "unpaid"
  description?: string
  location: string
  contact_info: string
  expires_at: string
}

export interface JobCommentForm {
  comment_text: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

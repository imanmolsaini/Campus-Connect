"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { lecturerAPI, lecturerFeedbackAPI, courseAPI } from "@/services/api"
import type { Lecturer, LecturerFeedback, Quote, LecturerFeedbackForm, Course } from "@/types"
import { Star, MessageSquare, QuoteIcon, User, PlusCircle, Trash2, Award, TrendingUp, Users } from "lucide-react"
import { format } from "date-fns"
import { RatingStars } from "@/components/ui/RatingStars"

export default function LecturerDetailPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useRequireAuth(true)
  const [lecturer, setLecturer] = useState<Lecturer | null>(null)
  const [feedback, setFeedback] = useState<LecturerFeedback[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LecturerFeedbackForm>()

  const selectedRating = watch("rating")

  useEffect(() => {
    if (id) {
      loadLecturerData(id as string)
    }
  }, [id])

  const loadLecturerData = async (lecturerId: string) => {
    setLoadingData(true)
    try {
      const [lecturerRes, coursesRes] = await Promise.all([lecturerAPI.getLecturer(lecturerId), courseAPI.getCourses()])

      if (lecturerRes.success && lecturerRes.data) {
        setLecturer(lecturerRes.data.lecturer)
        setFeedback(lecturerRes.data.recent_feedback)
        setQuotes(lecturerRes.data.recent_quotes)
      } else {
        toast.error(lecturerRes.message || "Failed to load lecturer details.")
      }

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data.courses)
      }
    } catch (error) {
      console.error("Failed to load lecturer data:", error)
      toast.error("Failed to load lecturer data.")
    } finally {
      setLoadingData(false)
    }
  }

  const calculateCategoryAverages = () => {
    const teachingRatings = feedback.filter((f) => f.teaching_quality).map((f) => f.teaching_quality!)
    const communicationRatings = feedback.filter((f) => f.communication_rating).map((f) => f.communication_rating!)
    const availabilityRatings = feedback.filter((f) => f.availability_rating).map((f) => f.availability_rating!)

    return {
      teaching: teachingRatings.length > 0 ? teachingRatings.reduce((a, b) => a + b, 0) / teachingRatings.length : null,
      communication:
        communicationRatings.length > 0
          ? communicationRatings.reduce((a, b) => a + b, 0) / communicationRatings.length
          : null,
      availability:
        availabilityRatings.length > 0
          ? availabilityRatings.reduce((a, b) => a + b, 0) / availabilityRatings.length
          : null,
    }
  }

  const categoryAverages = calculateCategoryAverages()

  const onSubmitFeedback = async (data: LecturerFeedbackForm) => {
    setIsSubmittingFeedback(true)
    try {
      const response = await lecturerFeedbackAPI.createFeedback({
        ...data,
        lecturer_id: lecturer?.id,
        rating: Number(data.rating),
        anonymous: data.anonymous || false,
        teaching_quality: data.teaching_quality ? Number(data.teaching_quality) : undefined,
        communication_rating: data.communication_rating ? Number(data.communication_rating) : undefined,
        availability_rating: data.availability_rating ? Number(data.availability_rating) : undefined,
      })

      if (response.success && response.data) {
        toast.success("Feedback submitted successfully!")
        reset()
        setShowFeedbackForm(false)
        if (lecturer?.id) loadLecturerData(lecturer.id)
      } else {
        toast.error(response.message || "Failed to submit feedback.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit feedback.")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) {
      return
    }

    setDeletingFeedbackId(feedbackId)
    try {
      const response = await lecturerFeedbackAPI.deleteFeedback(feedbackId)
      if (response.success) {
        toast.success("Feedback deleted successfully!")
        if (lecturer?.id) loadLecturerData(lecturer.id)
      } else {
        toast.error(response.message || "Failed to delete feedback.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete feedback.")
    } finally {
      setDeletingFeedbackId(null)
    }
  }

  if (authLoading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  if (!lecturer) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lecturer not found</h3>
          <p className="text-gray-600">The lecturer you are looking for does not exist.</p>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Lecturer Profile Header */}
        <Card className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8">
          <img
            src={lecturer.profile_image_url || "/placeholder.svg?height=160&width=120&query=default lecturer profile"}
            alt={lecturer.name}
            className="w-[120px] h-[160px] object-cover rounded-md border-4 border-primary-200 shadow-md"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{lecturer.name}</h1>
            {lecturer.description && <p className="text-gray-700 text-lg mb-4">{lecturer.description}</p>}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-600 text-sm">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-primary-500" />
                <span>{lecturer.feedback_count} Feedback</span>
              </div>
              <div className="flex items-center space-x-1">
                <QuoteIcon className="w-4 h-4 text-purple-500" />
                <span>{lecturer.quote_count} Quotes</span>
              </div>
              {typeof lecturer.avg_feedback_rating === "number" && lecturer.avg_feedback_rating > 0 ? (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <RatingStars rating={lecturer.avg_feedback_rating} size={16} />
                  <span>{lecturer.avg_feedback_rating.toFixed(1)} Avg. Rating</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No feedback yet</span>
              )}
            </div>
          </div>
        </Card>

        {/* Feedback Submission */}
        <div className="flex justify-end">
          <Button onClick={() => setShowFeedbackForm(!showFeedbackForm)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {showFeedbackForm ? "Hide Feedback Form" : "Give Feedback"}
          </Button>
        </div>

        {showFeedbackForm && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback for {lecturer.name}</h2>
            <form onSubmit={handleSubmit(onSubmitFeedback)} className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating (1-5 Stars)</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`cursor-pointer ${selectedRating && star <= selectedRating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      size={24}
                      onClick={() => setValue("rating", star, { shouldValidate: true })}
                    />
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register("rating", { required: "Overall rating is required", min: 1, max: 5 })}
                />
                {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
              </div>

              {/* Additional Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Teaching Quality (1-5)"
                  type="number"
                  {...register("teaching_quality", { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.teaching_quality?.message}
                  placeholder="e.g., 4"
                />
                <Input
                  label="Communication (1-5)"
                  type="number"
                  {...register("communication_rating", { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.communication_rating?.message}
                  placeholder="e.g., 5"
                />
                <Input
                  label="Availability (1-5)"
                  type="number"
                  {...register("availability_rating", { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.availability_rating?.message}
                  placeholder="e.g., 3"
                />
              </div>

              {/* Course Selection (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Course (Optional)</label>
                <select
                  {...register("course_id")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {errors.course_id && <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                <textarea
                  {...register("comment", { maxLength: { value: 1000, message: "Comment too long" } })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Share your thoughts on the lecturer..."
                />
                {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center">
                <input
                  id="anonymous-feedback"
                  type="checkbox"
                  {...register("anonymous")}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="anonymous-feedback" className="ml-2 block text-sm text-gray-900">
                  Post anonymously
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowFeedbackForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmittingFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="relative">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Feedback</h2>
                <p className="text-primary-100 text-sm">{feedback.length} reviews from students</p>
              </div>
            </div>
            {feedback.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <span className="text-white font-semibold">
                    {(feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            )}
          </div>

          {feedback.length > 0 &&
            (categoryAverages.teaching || categoryAverages.communication || categoryAverages.availability) && (
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Category Averages</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categoryAverages.teaching && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Teaching Quality</span>
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-blue-700">{categoryAverages.teaching.toFixed(1)}</span>
                        <span className="text-lg text-blue-600">/5</span>
                      </div>
                    </div>
                  )}
                  {categoryAverages.communication && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Communication</span>
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-green-700">
                          {categoryAverages.communication.toFixed(1)}
                        </span>
                        <span className="text-lg text-green-600">/5</span>
                      </div>
                    </div>
                  )}
                  {categoryAverages.availability && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Availability</span>
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold text-purple-700">
                          {categoryAverages.availability.toFixed(1)}
                        </span>
                        <span className="text-lg text-purple-600">/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div className="bg-gradient-to-b from-gray-50 to-white rounded-b-xl p-6 space-y-4">
            {feedback.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">No feedback yet</p>
                <p className="text-gray-500">Be the first to share your experience!</p>
              </div>
            ) : (
              feedback.map((f) => (
                <div
                  key={f.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-200 group"
                >
                  {/* Rating Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full border border-yellow-200">
                          <RatingStars rating={f.rating} size={18} />
                          <span className="text-lg font-bold text-gray-900">{f.rating}.0</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{f.anonymous ? "Anonymous" : f.reviewer_name}</span>
                        </div>
                      </div>
                      {f.course_name && (
                        <div className="inline-flex items-center space-x-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                          <span className="font-semibold">{f.course_code}</span>
                          <span>•</span>
                          <span>{f.course_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-400 font-medium">
                        {format(new Date(f.created_at), "MMM d, yyyy")}
                      </span>
                      {user && (user.id === f.user_id || user.role === "admin") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFeedback(f.id)}
                          loading={deletingFeedbackId === f.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  {f.comment && (
                    <p className="text-gray-700 leading-relaxed mb-4 pl-1 border-l-4 border-primary-200 bg-gray-50 p-3 rounded-r-lg">
                      {f.comment}
                    </p>
                  )}

                  {/* Detailed Ratings */}
                  {(f.teaching_quality || f.communication_rating || f.availability_rating) && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      {f.teaching_quality && (
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Teaching: {f.teaching_quality}/5</span>
                        </div>
                      )}
                      {f.communication_rating && (
                        <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">
                            Communication: {f.communication_rating}/5
                          </span>
                        </div>
                      )}
                      {f.availability_rating && (
                        <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">
                            Availability: {f.availability_rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quotes */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8">Recent Quotes</h2>
        <div className="space-y-6">
          {quotes.length === 0 ? (
            <Card className="text-center py-8">
              <QuoteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No quotes found for this lecturer yet.</p>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id} className="p-6">
                <blockquote className="text-xl italic text-gray-800 mb-3 relative pl-8">
                  <span className="absolute left-0 top-0 text-primary-400 text-5xl font-serif leading-none">"</span>
                  {quote.quote_text}
                </blockquote>
                <div className="text-sm text-gray-600 text-right">
                  — {quote.lecturer_name}
                  {quote.context && <span className="ml-2">({quote.context})</span>}
                  <span className="ml-2">• {format(new Date(quote.created_at), "MMM d, yyyy")}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

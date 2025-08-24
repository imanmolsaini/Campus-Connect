"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { courseAPI, reviewAPI } from "@/services/api"
import type { Course, Review, ReviewForm } from "@/types"
import { Star, MessageSquare, PlusCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { RatingStars } from "@/components/ui/RatingStars"

export default function ReviewsPage() {
  const { user, loading } = useRequireAuth(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReviewForm>()

  const selectedCourseId = watch("course_id")
  const selectedRating = watch("rating")

  useEffect(() => {
    loadPageData()
  }, [])

  const loadPageData = async () => {
    setLoadingData(true)
    try {
      const [coursesRes, reviewsRes] = await Promise.all([courseAPI.getCourses(), reviewAPI.getReviews()])

      if (coursesRes.success) setCourses(coursesRes.data.courses)
      if (reviewsRes.success) setReviews(reviewsRes.data.reviews)
    } catch (error) {
      console.error("Failed to load reviews page data:", error)
      toast.error("Failed to load data.")
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmitReview = async (data: ReviewForm) => {
    setIsSubmitting(true)
    try {
      const response = await reviewAPI.createReview({
        ...data,
        anonymous: data.anonymous || false,
        rating: Number(data.rating),
        difficulty_rating: data.difficulty_rating ? Number(data.difficulty_rating) : undefined,
        workload_rating: data.workload_rating ? Number(data.workload_rating) : undefined,
      })

      if (response.success && response.data) {
        toast.success("Review submitted successfully!")
        reset()
        setShowReviewForm(false)
        loadPageData()
      } else {
        toast.error(response.message || "Failed to submit review.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    setDeletingReviewId(reviewId)
    try {
      const response = await reviewAPI.deleteReview(reviewId)
      if (response.success) {
        toast.success("Review deleted successfully!")
        loadPageData()
      } else {
        toast.error(response.message || "Failed to delete review.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete review.")
    } finally {
      setDeletingReviewId(null)
    }
  }

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Course Reviews</h1>
            <p className="text-gray-600 mt-2">Share your experience and help other students choose courses.</p>
          </div>
          <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {showReviewForm ? "Hide Form" : "Write a Review"}
          </Button>
        </div>

        {showReviewForm && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Review</h2>
            <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-6">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  {...register("course_id", { required: "Please select a course" })}
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
                {selectedCourse && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedCourse.name}</strong>
                    </p>
                    <p className="text-xs text-blue-600">
                      Year {selectedCourse.year} • {selectedCourse.faculty.replace(/_/g, " ")} •{" "}
                      {selectedCourse.credits} credits
                    </p>
                  </div>
                )}
              </div>

              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating (1-5 Stars)</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`cursor-pointer ${
                        selectedRating && star <= selectedRating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Difficulty Rating (1-5)"
                  type="number"
                  {...register("difficulty_rating", { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.difficulty_rating?.message}
                  placeholder="e.g., 3"
                />
                <Input
                  label="Workload Rating (1-5)"
                  type="number"
                  {...register("workload_rating", { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.workload_rating?.message}
                  placeholder="e.g., 4"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                <textarea
                  {...register("comment", { maxLength: { value: 1000, message: "Comment too long" } })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Share your thoughts on the course..."
                />
                {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center">
                <input
                  id="anonymous"
                  type="checkbox"
                  {...register("anonymous")}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                  Post anonymously
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Submit Review
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* All Reviews Section */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8">All Course Reviews</h2>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <Card className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No reviews found. Be the first to write one!</p>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <RatingStars rating={review.rating} size={20} />
                    <span className="text-lg font-semibold text-gray-900">{review.rating}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                    {(user?.role === "admin" || user?.id === review.user_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                        loading={deletingReviewId === review.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <h3 className="text-md font-medium text-gray-800 mb-2">
                  {review.course_code} - {review.course_name}
                </h3>
                {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
                <div className="text-sm text-gray-600 flex items-center space-x-4">
                  <span>By {review.anonymous ? "Anonymous" : review.reviewer_name}</span>
                  {review.difficulty_rating && <span>• Difficulty: {review.difficulty_rating}/5</span>}
                  {review.workload_rating && <span>• Workload: {review.workload_rating}/5</span>}
                  {typeof review.would_recommend === "boolean" && (
                    <span>• Recommend: {review.would_recommend ? "Yes" : "No"}</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

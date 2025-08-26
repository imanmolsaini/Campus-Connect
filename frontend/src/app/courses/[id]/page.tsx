"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { courseAPI, reviewAPI } from "@/services/api"
import type { Course, Review } from "@/types"
import { BookOpen, Star, Users, ArrowLeft, MessageSquare, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { RatingStars } from "@/components/ui/RatingStars"

export default function CourseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadCourseData(id as string)
    }
  }, [id])

  const loadCourseData = async (courseId: string) => {
    setLoading(true)
    try {
      const [courseRes, reviewsRes] = await Promise.all([
        courseAPI.getCourse(courseId),
        reviewAPI.getReviews({ course_id: courseId }),
      ])

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data.course)
      }

      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data.reviews)
      }
    } catch (error) {
      console.error("Failed to load course data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  if (!course) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600">The course you are looking for does not exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </Card>
      </Layout>
    )
  }

  const facultyDisplayName = course.faculty.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {course.code}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Year {course.year}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {course.credits} credits
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{facultyDisplayName}</p>
              {course.description && <p className="text-gray-700">{course.description}</p>}
            </div>
          </div>
        </Card>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {typeof course.avg_rating === "number" && course.avg_rating > 0 ? course.avg_rating.toFixed(1) : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </Card>

          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{course.review_count || 0}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </Card>

          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {typeof course.avg_difficulty === "number" && course.avg_difficulty > 0
                ? course.avg_difficulty.toFixed(1)
                : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Difficulty</div>
          </Card>

          <Card className="text-center p-6">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {typeof course.avg_workload === "number" && course.avg_workload > 0
                ? course.avg_workload.toFixed(1)
                : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Workload</div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/notes?course=${course.code}`} className="flex-1">
            <Button className="w-full">
              <BookOpen className="w-4 h-4 mr-2" />
              View Course Notes
            </Button>
          </Link>
          <Link href={`/reviews?course=${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <Star className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          </Link>
        </div>

        {/* Recent Reviews */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <Card className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No reviews yet. Be the first to review this course!</p>
              <Link href={`/reviews?course=${course.id}`}>
                <Button className="mt-4">Write the First Review</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <RatingStars rating={review.rating} size={20} />
                      <span className="text-lg font-semibold text-gray-900">{review.rating}/5</span>
                    </div>
                    <span className="text-sm text-gray-500">{format(new Date(review.created_at), "MMM d, yyyy")}</span>
                  </div>
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
              ))}
              {reviews.length >= 5 && (
                <div className="text-center">
                  <Link href={`/reviews?course=${course.id}`}>
                    <Button variant="outline">View All Reviews</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

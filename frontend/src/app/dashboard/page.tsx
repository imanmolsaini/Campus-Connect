"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { courseAPI, noteAPI, reviewAPI } from "@/services/api"
import type { Course, Note, Review } from "@/types"
import { BookOpen, Upload, Star, MessageSquare, Download, TrendingUp, LayoutDashboard } from "lucide-react"
import { format } from "date-fns"
import { CommunityPanel } from "@/components/dashboard/CommunityPanel"

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [userNotes, setUserNotes] = useState<Note[]>([])
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [coursesRes, notesRes, userNotesRes, userReviewsRes] = await Promise.all([
        courseAPI.getCourses({ limit: 6 } as any),
        noteAPI.getNotes({ limit: 6 } as any),
        noteAPI.getUserNotes(),
        reviewAPI.getUserReviews(),
      ])

      if (coursesRes.success) setCourses(coursesRes.data.courses)
      if (notesRes.success) setRecentNotes(notesRes.data.notes)
      if (userNotesRes.success) setUserNotes(userNotesRes.data.notes)
      if (userReviewsRes.success) setUserReviews(userReviewsRes.data.reviews)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  const stats = [
    {
      name: "Notes Uploaded",
      value: userNotes.length,
      icon: Upload,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      name: "Reviews Written",
      value: userReviews.length,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      name: "Total Downloads",
      value: userNotes.reduce((sum, note) => sum + note.download_count, 0),
      icon: Download,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      name: "Available Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <LayoutDashboard className="w-7 h-7 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
              </div>
              <p className="text-gray-600 text-lg">Here's what's happening in your academic community</p>
            </div>

            {!user?.verified && (
              <div className="mt-4 md:mt-0">
                <Link href="/verify-email">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                  >
                    Verify Email
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.name}
                className="group border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg bg-white p-6"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-14 h-14 rounded-xl ${stat.bgColor} border-2 ${stat.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="border-2 border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/upload">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 h-12"
              >
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Upload Notes</span>
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 h-12"
              >
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                <span className="font-medium">Browse Courses</span>
              </Button>
            </Link>
            <Link href="/reviews">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-2 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 h-12"
              >
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                <span className="font-medium">Write Review</span>
              </Button>
            </Link>
            <Link href="/lecturers">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 h-12"
              >
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                <span className="font-medium">Lecturer Feedback</span>
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Recent Notes</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {recentNotes.length}
                </span>
              </div>
              <Link href="/notes">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotes.slice(0, 5).map((note) => (
                <div
                  key={note.id}
                  className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">{note.course_code}</span> • {note.uploader_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                    <Download className="w-3.5 h-3.5 text-green-600" />
                    <span className="font-medium">{note.download_count}</span>
                  </div>
                </div>
              ))}
              {recentNotes.length === 0 && (
                <div className="rounded-xl bg-gray-50 p-8 text-center border-2 border-dashed border-gray-300">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-gray-700 mb-1">No notes available yet</p>
                  <p className="text-sm text-gray-500">Check back later for new uploads</p>
                </div>
              )}
            </div>
          </Card>

          <CommunityPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2 border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Popular Courses</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {courses.length}
                </span>
              </div>
              <Link href="/courses">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                      {course.code} - {course.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Year {course.year} • <span className="font-medium">{course.review_count} reviews</span>
                    </p>
                  </div>
                  {typeof course.avg_rating === "number" && course.avg_rating > 0 ? (
                    <div className="flex items-center space-x-1.5 text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold">{course.avg_rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">No ratings</span>
                  )}
                </div>
              ))}
              {courses.length === 0 && (
                <div className="rounded-xl bg-gray-50 p-8 text-center border-2 border-dashed border-gray-300">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-gray-700 mb-1">No courses available yet</p>
                  <p className="text-sm text-gray-500">Courses will appear here soon</p>
                </div>
              )}
            </div>
          </Card>

          {(userNotes.length > 0 || userReviews.length > 0) && (
            <Card className="border-2 border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {userNotes.length + userReviews.length}
                </span>
              </div>
              <div className="space-y-4">
                {userNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 border-2 border-blue-300 flex items-center justify-center flex-shrink-0">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Uploaded "{note.title}"</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">{note.course_code}</span> •{" "}
                        {format(new Date(note.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-xs text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 font-medium">
                      {note.download_count} downloads
                    </div>
                  </div>
                ))}

                {userReviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Reviewed {review.course_code}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">{review.rating}/5 stars</span> •{" "}
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

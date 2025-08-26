"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import { courseAPI } from "@/services/api"
import type { Course } from "@/types"
import { Search, Star, BookOpen, Users, Filter, Upload, PlusCircle, Trash2 } from "lucide-react"

interface CourseForm {
  code: string
  name: string
  description?: string
  faculty: string
  year: number
  credits: number
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [showAddCourseForm, setShowAddCourseForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseForm>()

  useEffect(() => {
    loadCourses()
  }, [searchTerm, selectedFaculty, selectedYear])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (selectedFaculty) params.faculty = selectedFaculty
      if (selectedYear) params.year = Number.parseInt(selectedYear)

      const response = await courseAPI.getCourses(params)
      if (response.success) {
        setCourses(response.data.courses)
      }
    } catch (error) {
      console.error("Failed to load courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const onSubmitAddCourse = async (data: CourseForm) => {
    if (!user || user.role !== "admin") {
      toast.error("Admin access required")
      return
    }

    setIsSubmitting(true)
    try {
      console.log("Submitting course data:", data)
      const response = await courseAPI.createCourse(data)
      console.log("Course creation response:", response)

      if (response.success) {
        toast.success("Course created successfully!")
        reset()
        setShowAddCourseForm(false)
        await loadCourses()
      } else {
        toast.error(response.message || "Failed to create course")
      }
    } catch (error: any) {
      console.error("Course creation error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to create course"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!user || user.role !== "admin") {
      toast.error("Admin access required")
      return
    }

    if (
      !confirm(`Are you sure you want to delete "${courseName}"? This will also delete all related reviews and notes.`)
    ) {
      return
    }

    try {
      console.log("Deleting course:", courseId)
      const response = await courseAPI.deleteCourse(courseId)
      console.log("Course deletion response:", response)

      if (response.success) {
        toast.success("Course deleted successfully!")
        await loadCourses()
      } else {
        toast.error(response.message || "Failed to delete course")
      }
    } catch (error: any) {
      console.error("Course deletion error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete course"
      toast.error(errorMessage)
    }
  }

  const faculties = [
    { value: "business", label: "Business" },
    { value: "design_creative", label: "Design & Creative" },
    { value: "engineering_computer_mathematical", label: "Engineering & Computer Science" },
    { value: "health_environmental", label: "Health & Environmental" },
    { value: "maori_indigenous", label: "Māori & Indigenous" },
  ]

  const years = [
    { value: "1", label: "Year 1" },
    { value: "2", label: "Year 2" },
    { value: "3", label: "Year 3" },
    { value: "4", label: "Year 4" },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-2">Browse all available courses and their reviews</p>
          </div>
          <div className="flex space-x-2">
            {user?.role === "admin" && (
              <Button onClick={() => setShowAddCourseForm(!showAddCourseForm)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                {showAddCourseForm ? "Hide Form" : "Add Course"}
              </Button>
            )}
            <Link href="/upload">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Notes
              </Button>
            </Link>
          </div>
        </div>

        {showAddCourseForm && user?.role === "admin" && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Course</h2>
            <form onSubmit={handleSubmit(onSubmitAddCourse)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Course Code *"
                  {...register("code", {
                    required: "Course code is required",
                    maxLength: { value: 20, message: "Course code must be less than 20 characters" },
                  })}
                  error={errors.code?.message}
                  placeholder="e.g., COMP501"
                />
                <Input
                  label="Course Name *"
                  {...register("name", {
                    required: "Course name is required",
                    maxLength: { value: 200, message: "Course name must be less than 200 characters" },
                  })}
                  error={errors.name?.message}
                  placeholder="e.g., Introduction to Programming"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty *</label>
                  <select
                    {...register("faculty", { required: "Faculty is required" })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.value} value={faculty.value}>
                        {faculty.label}
                      </option>
                    ))}
                  </select>
                  {errors.faculty && <p className="mt-1 text-sm text-red-600">{errors.faculty.message}</p>}
                </div>

                <Input
                  label="Year *"
                  type="number"
                  {...register("year", {
                    required: "Year is required",
                    min: { value: 1, message: "Year must be between 1 and 4" },
                    max: { value: 4, message: "Year must be between 1 and 4" },
                    valueAsNumber: true,
                  })}
                  error={errors.year?.message}
                  placeholder="1-4"
                />

                <Input
                  label="Credits *"
                  type="number"
                  {...register("credits", {
                    required: "Credits is required",
                    min: { value: 1, message: "Credits must be at least 1" },
                    max: { value: 50, message: "Credits must be less than 50" },
                    valueAsNumber: true,
                  })}
                  error={errors.credits?.message}
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  {...register("description", {
                    maxLength: { value: 1000, message: "Description must be less than 1000 characters" },
                  })}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Brief description of the course..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddCourseForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty.value} value={faculty.value}>
                  {faculty.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedFaculty("")
                setSelectedYear("")
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Year {course.year}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{course.credits} credits</span>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
                    <p className="text-gray-600 text-sm">{course.name}</p>
                  </div>

                  {course.description && <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {typeof course.avg_rating === "number" && course.avg_rating > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{course.avg_rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No ratings</span>
                      )}

                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.review_count || 0} reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/courses/${course.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        <BookOpen className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/notes?course=${course.code}`} className="flex-1">
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        📚 View Notes
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State and Call-to-Action */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Share Your Study Materials</h3>
              <p className="text-blue-700 mb-4">
                Help fellow AUT students by uploading your notes, assignments, and study guides. Click "View Notes" on
                any course to see what's already available!
              </p>
              <Link href="/upload">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Notes
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

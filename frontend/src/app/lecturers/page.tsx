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
import { lecturerAPI } from "@/services/api"
import type { Lecturer, LecturerForm } from "@/types"
import { Users, Search, PlusCircle, MessageSquare, QuoteIcon, AlertCircle, Trash2 } from "lucide-react"
import { RatingStars } from "@/components/ui/RatingStars"

export default function LecturersPage() {
  const { user, loading: authLoading } = useAuth()
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddLecturerForm, setShowAddLecturerForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LecturerForm>()

  useEffect(() => {
    loadLecturers()
  }, [searchTerm])

  const loadLecturers = async () => {
    setLoadingData(true)
    try {
      const response = await lecturerAPI.getLecturers({ search: searchTerm })
      if (response.success) {
        setLecturers(response.data.lecturers)
      } else {
        toast.error(response.message || "Failed to load lecturers.")
      }
    } catch (error: any) {
      console.error("Failed to load lecturers:", error)
      toast.error(error.response?.data?.message || "Failed to load lecturers.")
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmitAddLecturer = async (data: LecturerForm) => {
    if (!user) {
      toast.error("You must be logged in to add lecturers.")
      return
    }

    if (user.role !== "admin") {
      toast.error("Only administrators can add lecturers.")
      return
    }

    setIsSubmitting(true)
    try {
      console.log("Submitting lecturer data:", data)

      const lecturerData = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
      }

      const response = await lecturerAPI.createLecturer(lecturerData)

      console.log("API response:", response)

      if (response.success) {
        toast.success("Lecturer added successfully!")
        reset()
        setShowAddLecturerForm(false)
        await loadLecturers()
      } else {
        toast.error(response.message || "Failed to add lecturer.")
      }
    } catch (error: any) {
      console.error("Error adding lecturer:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to add lecturer."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLecturer = async (lecturerId: string, lecturerName: string) => {
    if (!user || user.role !== "admin") {
      toast.error("Admin access required")
      return
    }

    if (
      !confirm(
        `Are you sure you want to delete "${lecturerName}"? This will also delete all related feedback and quotes.`,
      )
    ) {
      return
    }

    try {
      console.log("Deleting lecturer:", lecturerId)
      const response = await lecturerAPI.deleteLecturer(lecturerId)
      console.log("Lecturer deletion response:", response)

      if (response.success) {
        toast.success("Lecturer deleted successfully!")
        await loadLecturers()
      } else {
        toast.error(response.message || "Failed to delete lecturer")
      }
    } catch (error: any) {
      console.error("Lecturer deletion error:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete lecturer"
      toast.error(errorMessage)
    }
  }

  if (authLoading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Our Lecturers</h1>
            <p className="text-gray-600 mt-2">Browse and provide feedback for lecturers at AUT University.</p>
          </div>
          {user?.role === "admin" ? (
            <Button onClick={() => setShowAddLecturerForm(!showAddLecturerForm)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddLecturerForm ? "Hide Form" : "Add New Lecturer"}
            </Button>
          ) : user ? (
            <div className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Admin access required to add lecturers
            </div>
          ) : null}
        </div>

        {showAddLecturerForm && user?.role === "admin" && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Lecturer</h2>
            <form onSubmit={handleSubmit(onSubmitAddLecturer)} className="space-y-4">
              <Input
                label="Lecturer Name *"
                {...register("name", {
                  required: "Lecturer name is required",
                  minLength: { value: 1, message: "Name must be at least 1 character" },
                  maxLength: { value: 100, message: "Name must be less than 100 characters" },
                })}
                error={errors.name?.message}
                placeholder="e.g., Dr. Jane Doe"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>Profile Picture:</strong> To add a profile picture, place a PNG file named after the lecturer
                  in the <code className="bg-blue-100 px-1 rounded">frontend/public/images/profiles/</code> folder.
                  <br />
                  Example: For "John Smith", create <code className="bg-blue-100 px-1 rounded">johnsmith.png</code>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  {...register("description", {
                    maxLength: { value: 1000, message: "Description must be less than 1000 characters" },
                  })}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Brief description of the lecturer's expertise..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddLecturerForm(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Lecturer"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search lecturers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {lecturers.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No lecturers found" : "No lecturers available"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria."
                : user?.role === "admin"
                  ? "Add the first lecturer to get started."
                  : "Lecturers will appear here once they are added by administrators."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lecturers.map((lecturer) => (
              <div key={lecturer.id} className="relative">
                <Link href={`/lecturers/${lecturer.id}`}>
                  <Card className="flex flex-col items-center text-center p-6 hover:shadow-lg transition-shadow h-full">
                    <img
                      src={lecturer.profile_image_url || "/default-profile.png"}
                      alt={lecturer.name}
                      className="w-[120px] h-[160px] object-cover mb-4 rounded-md border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/default-profile.png"
                      }}
                    />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{lecturer.name}</h3>
                    {lecturer.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{lecturer.description}</p>
                    )}
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-auto pt-4 border-t border-gray-100 w-full">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4 text-primary-500" />
                        <span>{lecturer.feedback_count || 0} Feedback</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <QuoteIcon className="w-4 h-4 text-purple-500" />
                        <span>{lecturer.quote_count || 0} Quotes</span>
                      </div>
                    </div>
                    {typeof lecturer.avg_feedback_rating === "number" && lecturer.avg_feedback_rating > 0 ? (
                      <div className="flex items-center space-x-1 text-sm text-yellow-600 mt-2">
                        <RatingStars rating={lecturer.avg_feedback_rating} size={16} />
                        <span>{lecturer.avg_feedback_rating.toFixed(1)} Avg. Rating</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 mt-2">No feedback yet</span>
                    )}
                  </Card>
                </Link>
                {user?.role === "admin" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteLecturer(lecturer.id, lecturer.name)
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10"
                    title="Delete lecturer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

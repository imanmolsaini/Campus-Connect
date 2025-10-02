"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import { noteAPI, courseAPI } from "@/services/api"
import type { Note, Course } from "@/types"
import { Search, Download, FileText, Filter, Upload, BookOpen, Trash2 } from "lucide-react"
import { format } from "date-fns"
import toast from "react-hot-toast"

export default function NotesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const courseParam = searchParams.get("course")

  const [notes, setNotes] = useState<Note[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState(courseParam || "")
  const [selectedType, setSelectedType] = useState("")

  useEffect(() => {
    loadData()
  }, [searchTerm, selectedCourse, selectedType])

  const loadData = async () => {
    setLoading(true)
    try {
      const [notesRes, coursesRes] = await Promise.all([
        noteAPI.getNotes({
          search: searchTerm,
          course_code: selectedCourse,
          type: selectedType,
        }),
        courseAPI.getCourses(),
      ])

      if (notesRes.success) {
        setNotes(notesRes.data.notes)
      }

      if (coursesRes.success) {
        setCourses(coursesRes.data.courses)
      }
    } catch (error) {
      console.error("Failed to load notes:", error)
      toast.error("Failed to load notes.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (noteId: string, title: string) => {
    try {
      await noteAPI.downloadNote(noteId)
      toast.success(`Downloaded: ${title}`)
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Download failed. Please try again.")
    }
  }

  const handleDelete = async (noteId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      const response = await noteAPI.deleteNote(noteId)
      if (response.success) {
        toast.success("Note deleted successfully")
        loadData() // Reload the notes list
      } else {
        toast.error(response.message || "Failed to delete note")
      }
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error("Failed to delete note")
    }
  }

  const noteTypes = [
    { value: "lecture_notes", label: "Lecture Notes" },
    { value: "assignment", label: "Assignment" },
    { value: "exam_prep", label: "Exam Preparation" },
    { value: "tutorial", label: "Tutorial" },
    { value: "other", label: "Other" },
  ]

  const getTypeColor = (type: string) => {
    const colors = {
      lecture_notes: "bg-blue-100 text-blue-800",
      assignment: "bg-green-100 text-green-800",
      exam_prep: "bg-red-100 text-red-800",
      tutorial: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      lecture_notes: "Lecture Notes",
      assignment: "Assignment",
      exam_prep: "Exam Prep",
      tutorial: "Tutorial",
      other: "Other",
    }
    return labels[type as keyof typeof labels] || "Other"
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Notes</h1>
            <p className="text-gray-600 mt-2">Browse and download study materials shared by AUT students.</p>
          </div>
          {user && user.verified && (
            <Link href="/upload">
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Notes
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">All Types</option>
              {noteTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCourse("")
                setSelectedType("")
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCourse || selectedType
                ? "Try adjusting your search criteria or filters."
                : "No study notes have been uploaded yet."}
            </p>
            {user && user.verified && (
              <Link href="/upload">
                <Button className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload the First Note
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 relative"
              >
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="p-6 space-y-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getTypeColor(note.type)}`}
                        >
                          {getTypeLabel(note.type)}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm">
                          {note.course_code}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium mt-1">{note.course_name}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      {user && user.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(note.id, note.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {note.description && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-sm text-gray-700 line-clamp-3">{note.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">By {note.uploader_name}</p>
                      <p className="text-xs text-gray-500">{format(new Date(note.created_at), "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end space-x-1.5 text-primary-600 font-semibold">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">{note.download_count}</span>
                      </div>
                      {note.file_size && (
                        <p className="text-xs text-gray-500 font-medium">
                          {(note.file_size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(note.id, note.title)}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all duration-300 group/btn"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info for non-authenticated users */}
        {!user && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="p-6 text-center">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Want to contribute?</h3>
              <p className="text-blue-700 mb-4">
                Sign up with your AUT email to upload and share your own study notes with fellow students.
              </p>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

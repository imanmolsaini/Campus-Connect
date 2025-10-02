//frontend/src/app/quotes/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { lecturerAPI, quoteAPI } from "@/services/api"
import type { Lecturer, Quote, QuoteForm } from "@/types"
import { QuoteIcon, PlusCircle, Search, Trash2, MessageSquare, User, Calendar } from "lucide-react"
import { format } from "date-fns"

export default function QuotesPage() {
  const { user, loading: authLoading } = useRequireAuth(true)
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddQuoteForm, setShowAddQuoteForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLecturerFilter, setSelectedLecturerFilter] = useState("")
  const [deletingQuoteId, setDeletingQuoteId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<QuoteForm>()

  const selectedLecturerForForm = watch("lecturer_id")

  useEffect(() => {
    loadPageData()
  }, [searchTerm, selectedLecturerFilter])

  const loadPageData = async () => {
    setLoadingData(true)
    try {
      const [lecturersRes, quotesRes] = await Promise.all([
        lecturerAPI.getLecturers(),
        quoteAPI.getQuotes({ search: searchTerm, lecturer_id: selectedLecturerFilter }),
      ])

      if (lecturersRes.success && lecturersRes.data) setLecturers(lecturersRes.data.lecturers)
      if (quotesRes.success && quotesRes.data) setQuotes(quotesRes.data.quotes)
    } catch (error) {
      console.error("Failed to load quotes page data:", error)
      toast.error("Failed to load data.")
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmitQuote = async (data: QuoteForm) => {
    setIsSubmitting(true)
    try {
      const response = await quoteAPI.createQuote(data)
      if (response.success) {
        toast.success("Quote added successfully!")
        reset()
        setShowAddQuoteForm(false)
        loadPageData()
      } else {
        toast.error(response.message || "Failed to add quote.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add quote.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to delete this quote?")) return

    setDeletingQuoteId(quoteId)
    try {
      const response = await quoteAPI.deleteQuote(quoteId)
      if (response.success) {
        toast.success("Quote deleted successfully!")
        loadPageData()
      } else {
        toast.error(response.message || "Failed to delete quote.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete quote.")
    } finally {
      setDeletingQuoteId(null)
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

  const selectedLecturerObject = lecturers.find((l) => l.id === selectedLecturerForForm)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MessageSquare className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Lecturer Quotes</h1>
              </div>
              <p className="text-gray-600 text-lg">Memorable quotes from your lecturers. Add your favorites!</p>
            </div>
            <Button
              onClick={() => setShowAddQuoteForm(!showAddQuoteForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddQuoteForm ? "Hide Form" : "Add Quote"}
            </Button>
          </div>
        </div>

        {showAddQuoteForm && (
          <Card className="border-2 border-blue-100 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <QuoteIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Add a New Quote</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmitQuote)} className="space-y-6">
              {/* Lecturer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                <select
                  {...register("lecturer_id", { required: "Please select a lecturer" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a lecturer...</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name}
                    </option>
                  ))}
                </select>
                {errors.lecturer_id && <p className="mt-1 text-sm text-red-600">{errors.lecturer_id.message}</p>}
                {selectedLecturerObject && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg flex items-center space-x-3 border border-blue-200">
                    <img
                      src={
                        selectedLecturerObject.profile_image_url ||
                        "/placeholder.svg?height=40&width=40&query=lecturer profile" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={selectedLecturerObject.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-blue-900">{selectedLecturerObject.name}</p>
                      {selectedLecturerObject.description && (
                        <p className="text-xs text-blue-700 line-clamp-1">{selectedLecturerObject.description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quote Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                <textarea
                  {...register("quote_text", {
                    required: "Quote text is required",
                    maxLength: { value: 1000, message: "Quote too long" },
                  })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter the lecturer's memorable quote..."
                />
                {errors.quote_text && <p className="mt-1 text-sm text-red-600">{errors.quote_text.message}</p>}
              </div>

              {/* Context (Optional) */}
              <Input
                label="Context (Optional)"
                {...register("context", { maxLength: { value: 500, message: "Context too long" } })}
                error={errors.context?.message}
                placeholder="e.g., During the final exam review"
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddQuoteForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  Add Quote
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedLecturerFilter}
              onChange={(e) => setSelectedLecturerFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Lecturers</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-gray-900">All Quotes</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
          </span>
        </div>

        <div className="space-y-6">
          {quotes.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-12 text-center border-2 border-dashed border-gray-300">
              <QuoteIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-700 mb-2">No quotes found</p>
              <p className="text-gray-500">Be the first to add a memorable quote!</p>
            </div>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="group">
                <Card className="p-6 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-white">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={quote.profile_image_url || "/placeholder.svg?height=60&width=60&query=lecturer profile"}
                        alt={quote.lecturer_name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-300"
                      />
                    </div>
                    <div className="flex-1">
                      <blockquote className="text-xl text-gray-800 mb-4 relative pl-8">
                        <span className="absolute left-0 top-0 text-5xl font-serif leading-none text-blue-200">"</span>
                        <span className="relative italic">{quote.quote_text}</span>
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <User className="w-4 h-4 text-blue-600" />
                            {quote.lecturer_name}
                          </div>
                          {quote.context && (
                            <div className="text-sm text-gray-600 italic pl-6 bg-gray-50 py-1 px-3 rounded-md inline-block">
                              {quote.context}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 pl-6">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                              By {quote.uploader_name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(quote.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        {(user?.role === "admin" || user?.id === quote.user_id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuote(quote.id)}
                            loading={deletingQuoteId === quote.id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

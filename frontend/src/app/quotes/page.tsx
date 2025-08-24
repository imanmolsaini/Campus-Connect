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
import { QuoteIcon, PlusCircle, Search, Trash2 } from "lucide-react"
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

      if (lecturersRes.success) setLecturers(lecturersRes.data.lecturers)
      if (quotesRes.success) setQuotes(quotesRes.data.quotes)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lecturer Quotes</h1>
            <p className="text-gray-600 mt-2">Memorable quotes from your lecturers. Add your favorites!</p>
          </div>
          <Button onClick={() => setShowAddQuoteForm(!showAddQuoteForm)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {showAddQuoteForm ? "Hide Form" : "Add a Quote"}
          </Button>
        </div>

        {showAddQuoteForm && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add a New Quote</h2>
            <form onSubmit={handleSubmit(onSubmitQuote)} className="space-y-6">
              {/* Lecturer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer</label>
                <select
                  {...register("lecturer_id", { required: "Please select a lecturer" })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                  <div className="mt-2 p-3 bg-blue-50 rounded-md flex items-center space-x-3">
                    <img
                      src={
                        selectedLecturerObject.profile_image_url ||
                        "/placeholder.svg?height=40&width=40&query=lecturer profile" ||
                        "/placeholder.svg"
                      }
                      alt={selectedLecturerObject.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-blue-800">{selectedLecturerObject.name}</p>
                      {selectedLecturerObject.description && (
                        <p className="text-xs text-blue-600 line-clamp-1">{selectedLecturerObject.description}</p>
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                <Button type="submit" loading={isSubmitting}>
                  Add Quote
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedLecturerFilter}
              onChange={(e) => setSelectedLecturerFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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

        {/* All Quotes Section */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8">All Quotes</h2>
        <div className="space-y-6">
          {quotes.length === 0 ? (
            <Card className="text-center py-8">
              <QuoteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No quotes found. Be the first to add one!</p>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id} className="p-6 flex items-start space-x-4">
                <img
                  src={quote.profile_image_url || "/placeholder.svg?height=60&width=60&query=lecturer profile"}
                  alt={quote.lecturer_name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-primary-200"
                />
                <div className="flex-1">
                  <blockquote className="text-xl italic text-gray-800 mb-3 relative pl-8">
                    <span className="absolute left-0 top-0 text-primary-400 text-5xl font-serif leading-none">"</span>
                    {quote.quote_text}
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      — {quote.lecturer_name}
                      {quote.context && <span className="ml-2">({quote.context})</span>}
                      <span className="ml-2">• By {quote.uploader_name}</span>
                      <span className="ml-2">• {format(new Date(quote.created_at), "MMM d, yyyy")}</span>
                    </div>
                    {(user?.role === "admin" || user?.id === quote.user_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.id)}
                        loading={deletingQuoteId === quote.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import { jobAPI } from "@/services/api"
import type { Job, JobForm, JobComment } from "@/types"
import {
  PlusCircle,
  Search,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Briefcase,
  Trash2,
  Clock,
  User,
  MessageCircle,
  Send,
  DollarSign,
} from "lucide-react"
import { format, isAfter } from "date-fns"

const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "part-time", label: "Part-time" },
  { value: "full-time", label: "Full-time" },
  { value: "casual", label: "Casual" },
  { value: "voluntary", label: "Voluntary" },
]

const PAY_TYPES = [
  { value: "hourly", label: "Hourly" },
  { value: "weekly", label: "Weekly" },
  { value: "fixed", label: "Fixed" },
  { value: "unpaid", label: "Unpaid" },
]

const SORT_OPTIONS = [
  { value: "new", label: "New" },
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top Rated" },
  { value: "expiry", label: "Expiring Soon" },
]

export default function JobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJobType, setSelectedJobType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortBy, setSortBy] = useState("new")
  const [votingJobId, setVotingJobId] = useState<string | null>(null)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [jobComments, setJobComments] = useState<{ [key: string]: JobComment[] }>({})
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<JobForm>()

  const watchJobType = watch("job_type")

  useEffect(() => {
    loadJobs()
  }, [searchTerm, selectedJobType, selectedLocation, sortBy])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const response = await jobAPI.getJobs({
        search: searchTerm,
        job_type: selectedJobType,
        location: selectedLocation,
        sort: sortBy,
      })
      if (response.success) {
        setJobs(response.data.jobs)
      }
    } catch (error) {
      console.error("Failed to load jobs:", error)
      toast.error("Failed to load jobs.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmitJob = async (data: JobForm) => {
    setIsSubmitting(true)
    try {
      const response = await jobAPI.createJob(data)
      if (response.success) {
        toast.success("Job posted successfully!")
        reset()
        setShowAddForm(false)
        loadJobs()
      } else {
        toast.error(response.message || "Failed to post job.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post job.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (jobId: string, voteType: "up" | "down") => {
    if (!user) {
      toast.error("Please login to vote on jobs.")
      return
    }

    setVotingJobId(jobId)
    try {
      const response = await jobAPI.voteJob(jobId, voteType)
      if (response.success) {
        loadJobs() // Refresh to get updated vote counts
      } else {
        toast.error(response.message || "Failed to vote.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to vote.")
    } finally {
      setVotingJobId(null)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    setDeletingJobId(jobId)
    try {
      const response = await jobAPI.deleteJob(jobId)
      if (response.success) {
        toast.success("Job deleted successfully!")
        loadJobs()
      } else {
        toast.error(response.message || "Failed to delete job.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete job.")
    } finally {
      setDeletingJobId(null)
    }
  }

  const loadJobComments = async (jobId: string) => {
    try {
      const response = await jobAPI.getJobComments(jobId)
      if (response.success) {
        setJobComments((prev) => ({ ...prev, [jobId]: response.data.comments }))
      }
    } catch (error) {
      console.error("Failed to load comments:", error)
    }
  }

  const handleToggleComments = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
    } else {
      setExpandedJobId(jobId)
      if (!jobComments[jobId]) {
        loadJobComments(jobId)
      }
    }
  }

  const handleSubmitComment = async (jobId: string) => {
    if (!user) {
      toast.error("Please login to comment.")
      return
    }

    const text = commentText[jobId]?.trim()
    if (!text) return

    setSubmittingComment(jobId)
    try {
      const response = await jobAPI.createJobComment(jobId, { comment_text: text })
      if (response.success) {
        setCommentText((prev) => ({ ...prev, [jobId]: "" }))
        loadJobComments(jobId) // Refresh comments
        loadJobs() // Refresh to update comment count
      } else {
        toast.error(response.message || "Failed to post comment.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post comment.")
    } finally {
      setSubmittingComment(null)
    }
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case "full-time":
        return "bg-blue-100 text-blue-800"
      case "part-time":
        return "bg-green-100 text-green-800"
      case "casual":
        return "bg-yellow-100 text-yellow-800"
      case "voluntary":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs & Voluntary Work</h1>
            <p className="text-gray-600 mt-2">Find part-time jobs, internships, and volunteer opportunities</p>
          </div>
          {user && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddForm ? "Hide Form" : "Post Job"}
            </Button>
          )}
        </div>

        {/* Add Job Form */}
        {showAddForm && user && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Post a New Job</h2>
            <form onSubmit={handleSubmit(onSubmitJob)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Job Title *"
                    {...register("title", { required: "Title is required" })}
                    error={errors.title?.message}
                    placeholder="e.g., Part-time Barista, Marketing Intern, Event Volunteer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <select
                    {...register("job_type", { required: "Job type is required" })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select job type</option>
                    {JOB_TYPES.slice(1).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.job_type && <p className="mt-1 text-sm text-red-600">{errors.job_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Type</label>
                  <select
                    {...register("pay_type")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select pay type</option>
                    {PAY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Pay Rate"
                    {...register("pay_rate")}
                    error={errors.pay_rate?.message}
                    placeholder={watchJobType === "voluntary" ? "Unpaid" : "e.g., $25/hour, $500/week, $2000 fixed"}
                    disabled={watchJobType === "voluntary"}
                  />
                </div>

                <div>
                  <Input
                    label="Location *"
                    {...register("location", { required: "Location is required" })}
                    error={errors.location?.message}
                    placeholder="e.g., Auckland CBD, Remote, University Campus"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Expires At *"
                    type="datetime-local"
                    {...register("expires_at", { required: "Expiry date is required" })}
                    error={errors.expires_at?.message}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe the role, requirements, responsibilities, and any other relevant details..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information *</label>
                  <textarea
                    {...register("contact_info", { required: "Contact information is required" })}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="How to apply: email, phone, website, application process, etc."
                  />
                  {errors.contact_info && <p className="mt-1 text-sm text-red-600">{errors.contact_info.message}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Post Job
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters and Sort */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {JOB_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="Filter by location..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <Card className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No jobs found. Be the first to post one!</p>
            </Card>
          ) : (
            jobs.map((job) => {
              const isExpired = job.expires_at && isAfter(new Date(), new Date(job.expires_at))

              return (
                <Card key={job.id} className={`p-4 ${isExpired ? "opacity-60" : ""}`}>
                  <div className="flex space-x-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(job.id, "up")}
                        disabled={!user || votingJobId === job.id}
                        className={`p-1 ${job.user_vote === "up" ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-green-600"}`}
                      >
                        <TrendingUp className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-medium text-gray-700">
                        {(job.upvotes || 0) - (job.downvotes || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(job.id, "down")}
                        disabled={!user || votingJobId === job.id}
                        className={`p-1 ${job.user_vote === "down" ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-red-600"}`}
                      >
                        <TrendingDown className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Job Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.title}
                              {isExpired && <span className="ml-2 text-sm text-red-500">(Expired)</span>}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}
                            >
                              {job.job_type}
                            </span>
                          </div>

                          {/* Pay Info */}
                          {job.pay_rate && (
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-lg font-medium text-green-600">{job.pay_rate}</span>
                              {job.pay_type && <span className="text-sm text-gray-500">({job.pay_type})</span>}
                            </div>
                          )}

                          {/* Description */}
                          {job.description && <p className="text-gray-700 mb-3 line-clamp-3">{job.description}</p>}

                          {/* Meta Info */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{job.uploader_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{format(new Date(job.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Expires {format(new Date(job.expires_at), "MMM d")}</span>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">How to Apply:</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.contact_info}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleComments(job.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Comments ({job.comment_count || 0})
                            </Button>
                            {(user?.role === "admin" || user?.id === job.user_id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                loading={deletingJobId === job.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {/* Comments Section */}
                          {expandedJobId === job.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {/* Add Comment */}
                              {user && (
                                <div className="flex space-x-3 mb-4">
                                  <div className="flex-1">
                                    <textarea
                                      value={commentText[job.id] || ""}
                                      onChange={(e) =>
                                        setCommentText((prev) => ({ ...prev, [job.id]: e.target.value }))
                                      }
                                      placeholder="Ask a question or leave a comment..."
                                      rows={2}
                                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitComment(job.id)}
                                    loading={submittingComment === job.id}
                                    disabled={!commentText[job.id]?.trim()}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}

                              {/* Comments List */}
                              <div className="space-y-3">
                                {jobComments[job.id]?.map((comment) => (
                                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">{comment.user_name}</span>
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.comment_text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

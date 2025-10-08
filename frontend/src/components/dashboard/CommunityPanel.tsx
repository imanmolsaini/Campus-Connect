"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { communityAPI } from "@/services/api"
import type { CommunityQuestion, CommunityReply } from "@/types"
import { MessageSquare, Send, CheckCircle, Clock, X, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"
import toast from "react-hot-toast"

export function CommunityPanel() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<CommunityQuestion[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<CommunityQuestion | null>(null)
  const [replies, setReplies] = useState<CommunityReply[]>([])
  const [loading, setLoading] = useState(true)
  const [showAskModal, setShowAskModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({ title: "", details: "" })
  const [replyContent, setReplyContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "question" | "reply"; id: string } | null>(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const response = await communityAPI.getQuestions({ limit: 10, sort: "new" })
      if (response.success) {
        setQuestions(response.data.questions)
      }
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (questionId: string) => {
    try {
      const response = await communityAPI.getQuestionReplies(questionId)
      if (response.success) {
        setReplies(response.data.replies)
      }
    } catch (error) {
      console.error("Failed to load replies:", error)
    }
  }

  const handleAskQuestion = async () => {
    if (!newQuestion.title.trim()) {
      toast.error("Please enter a question title")
      return
    }

    if (newQuestion.title.trim().length < 5) {
      toast.error("Question title must be at least 5 characters long")
      return
    }

    if (!newQuestion.details.trim()) {
      toast.error("Please provide question details")
      return
    }

    if (newQuestion.details.trim().length < 10) {
      toast.error("Question details must be at least 10 characters long")
      return
    }

    setSubmitting(true)
    try {
      const response = await communityAPI.createQuestion({
        title: newQuestion.title,
        content: newQuestion.details,
      })
      if (response.success) {
        toast.success("Question posted successfully!")
        setNewQuestion({ title: "", details: "" })
        setShowAskModal(false)
        loadQuestions()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to post question")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedQuestion) return

    setSubmitting(true)
    try {
      const response = await communityAPI.createReply(selectedQuestion.id, { content: replyContent })
      if (response.success) {
        toast.success("Reply posted successfully!")
        setReplyContent("")
        loadReplies(selectedQuestion.id)
        loadQuestions()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post reply")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    setSubmitting(true)
    try {
      const response = await communityAPI.deleteQuestion(questionId)
      if (response.success) {
        toast.success("Question deleted successfully!")
        setDeleteConfirm(null)
        setSelectedQuestion(null)
        loadQuestions()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete question")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    setSubmitting(true)
    try {
      const response = await communityAPI.deleteReply(replyId)
      if (response.success) {
        toast.success("Reply deleted successfully!")
        setDeleteConfirm(null)
        if (selectedQuestion) {
          loadReplies(selectedQuestion.id)
        }
        loadQuestions()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete reply")
    } finally {
      setSubmitting(false)
    }
  }

  const canDelete = (itemUserId: string) => {
    return user?.role === "admin" || user?.id === itemUserId
  }

  const handleSelectQuestion = (question: CommunityQuestion) => {
    setSelectedQuestion(question)
    loadReplies(question.id)
  }

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Community Q&A</h2>
          </div>
          <Button size="sm" onClick={() => setShowAskModal(true)}>
            Ask Question
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No questions yet. Be the first to ask!</p>
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                onClick={() => handleSelectQuestion(question)}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {question.is_resolved ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-900 truncate">{question.title}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      by {question.author_name} • {question.reply_count} replies •{" "}
                      {format(new Date(question.created_at), "MMM d")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Ask a Question</h3>
                <button onClick={() => setShowAskModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Title
                    <span className="text-xs text-gray-500 ml-2">(min 5 characters)</span>
                  </label>
                  <input
                    type="text"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    placeholder="What's your question?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newQuestion.title.length}/200</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Details
                    <span className="text-xs text-gray-500 ml-2">(min 10 characters)</span>
                  </label>
                  <textarea
                    value={newQuestion.details}
                    onChange={(e) => setNewQuestion({ ...newQuestion, details: e.target.value })}
                    placeholder="Provide more details about your question..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{newQuestion.details.length}/2000</p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAskModal(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAskQuestion} disabled={submitting}>
                    {submitting ? "Posting..." : "Post Question"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Details Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {selectedQuestion.is_resolved ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900">{selectedQuestion.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {canDelete(selectedQuestion.user_id) && (
                    <button
                      onClick={() => setDeleteConfirm({ type: "question", id: selectedQuestion.id })}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setSelectedQuestion(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-wrap mb-2">{selectedQuestion.content}</p>
                <p className="text-sm text-gray-500">
                  Asked by {selectedQuestion.author_name} •{" "}
                  {format(new Date(selectedQuestion.created_at), "MMM d, yyyy")}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Replies ({replies.length})</h4>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {replies.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No replies yet. Be the first to help!</p>
                  ) : (
                    replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm mb-2 whitespace-pre-wrap">{reply.content}</p>
                            <p className="text-xs text-gray-500">
                              {reply.author_name} • {format(new Date(reply.created_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                          {canDelete(reply.user_id) && (
                            <button
                              onClick={() => setDeleteConfirm({ type: "reply", id: reply.id })}
                              className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                              title="Delete reply"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                  />
                  <Button onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (deleteConfirm.type === "question") {
                    handleDeleteQuestion(deleteConfirm.id)
                  } else {
                    handleDeleteReply(deleteConfirm.id)
                  }
                }}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

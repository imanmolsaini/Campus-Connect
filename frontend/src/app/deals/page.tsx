"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import { dealAPI } from "@/services/api"
import type { Deal, DealForm } from "@/types"
import {
  PlusCircle,
  Search,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Calendar,
  DollarSign,
  Trash2,
  Clock,
  Tag,
  User,
} from "lucide-react"
import { format, isAfter } from "date-fns"

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "computing", label: "Computing" },
  { value: "electronics", label: "Electronics" },
  { value: "software", label: "Software" },
  { value: "gaming", label: "Gaming" },
  { value: "books", label: "Books" },
  { value: "food", label: "Food & Drinks" },
  { value: "clothing", label: "Clothing" },
  { value: "general", label: "General" },
]

const SORT_OPTIONS = [
  { value: "new", label: "New" },
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top Rated" },
]

export default function DealsPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("new")
  const [votingDealId, setVotingDealId] = useState<string | null>(null)
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<DealForm>()

  const watchOriginalPrice = watch("original_price")
  const watchDealPrice = watch("deal_price")

  useEffect(() => {
    loadDeals()
  }, [searchTerm, selectedCategory, sortBy])

  const loadDeals = async () => {
    setLoading(true)
    try {
      const response = await dealAPI.getDeals({
        search: searchTerm,
        category: selectedCategory,
        sort: sortBy,
      })
      if (response.success) {
        setDeals(response.data.deals)
      }
    } catch (error) {
      console.error("Failed to load deals:", error)
      toast.error("Failed to load deals.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmitDeal = async (data: DealForm) => {
    setIsSubmitting(true)
    try {
      const dealData = {
        ...data,
        original_price: data.original_price ? Number.parseFloat(data.original_price) : undefined,
        deal_price: data.deal_price ? Number.parseFloat(data.deal_price) : undefined,
      }

      const response = await dealAPI.createDeal(dealData)
      if (response.success) {
        toast.success("Deal posted successfully!")
        reset()
        setShowAddForm(false)
        loadDeals()
      } else {
        toast.error(response.message || "Failed to post deal.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post deal.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (dealId: string, voteType: "up" | "down") => {
    if (!user) {
      toast.error("Please login to vote on deals.")
      return
    }

    setVotingDealId(dealId)
    try {
      const response = await dealAPI.voteDeal(dealId, voteType)
      if (response.success) {
        loadDeals() // Refresh to get updated vote counts
      } else {
        toast.error(response.message || "Failed to vote.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to vote.")
    } finally {
      setVotingDealId(null)
    }
  }

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return

    setDeletingDealId(dealId)
    try {
      const response = await dealAPI.deleteDeal(dealId)
      if (response.success) {
        toast.success("Deal deleted successfully!")
        loadDeals()
      } else {
        toast.error(response.message || "Failed to delete deal.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete deal.")
    } finally {
      setDeletingDealId(null)
    }
  }

  const calculateDiscount = (original: string, deal: string) => {
    const orig = Number.parseFloat(original)
    const dealPrice = Number.parseFloat(deal)
    if (orig && dealPrice && orig > dealPrice) {
      return Math.round(((orig - dealPrice) / orig) * 100)
    }
    return null
  }

  const discount = calculateDiscount(watchOriginalPrice || "", watchDealPrice || "")

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
            <h1 className="text-3xl font-bold text-gray-900">Deals and Coupons</h1>
            <p className="text-gray-600 mt-2">Share and discover the best deals online</p>
          </div>
          {user && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddForm ? "Hide Form" : "Post Deal"}
            </Button>
          )}
        </div>

        {/* Add Deal Form */}
        {showAddForm && user && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Post a New Deal</h2>
            <form onSubmit={handleSubmit(onSubmitDeal)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Deal Title *"
                    {...register("title", { required: "Title is required" })}
                    error={errors.title?.message}
                    placeholder="e.g., RTX 4070 Graphics Card 50% Off"
                  />
                </div>

                <div>
                  <Input
                    label="Original Price ($)"
                    type="number"
                    step="0.01"
                    {...register("original_price")}
                    error={errors.original_price?.message}
                    placeholder="299.99"
                  />
                </div>

                <div>
                  <Input
                    label="Deal Price ($)"
                    type="number"
                    step="0.01"
                    {...register("deal_price")}
                    error={errors.deal_price?.message}
                    placeholder="149.99"
                  />
                  {discount && <p className="text-sm text-green-600 mt-1">{discount}% discount</p>}
                </div>

                <div>
                  <Input
                    label="Website URL"
                    type="url"
                    {...register("website_url")}
                    error={errors.website_url?.message}
                    placeholder="https://example.com/deal"
                  />
                </div>

                <div>
                  <Input
                    label="Website Name"
                    {...register("website_name")}
                    error={errors.website_name?.message}
                    placeholder="e.g., Amazon, PB Tech"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    {...register("category")}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    {CATEGORIES.slice(1).map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Expires At"
                    type="datetime-local"
                    {...register("expires_at")}
                    error={errors.expires_at?.message}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Image URL"
                    type="url"
                    {...register("image_url")}
                    error={errors.image_url?.message}
                    placeholder="https://example.com/product-image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe the deal, any special conditions, or why it's a great offer..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Post Deal
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters and Sort */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
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

        {/* Deals List */}
        <div className="space-y-4">
          {deals.length === 0 ? (
            <Card className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No deals found. Be the first to post one!</p>
            </Card>
          ) : (
            deals.map((deal) => {
              const isExpired = deal.expires_at && isAfter(new Date(), new Date(deal.expires_at))

              return (
                <Card key={deal.id} className={`p-4 ${isExpired ? "opacity-60" : ""}`}>
                  <div className="flex space-x-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(deal.id, "up")}
                        disabled={!user || votingDealId === deal.id}
                        className={`p-1 ${deal.user_vote === "up" ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-green-600"}`}
                      >
                        <TrendingUp className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-medium text-gray-700">
                        {(deal.upvotes || 0) - (deal.downvotes || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(deal.id, "down")}
                        disabled={!user || votingDealId === deal.id}
                        className={`p-1 ${deal.user_vote === "down" ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-red-600"}`}
                      >
                        <TrendingDown className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Deal Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {deal.title}
                            {isExpired && <span className="ml-2 text-sm text-red-500">(Expired)</span>}
                          </h3>

                          {/* Price Info */}
                          {(deal.original_price || deal.deal_price) && (
                            <div className="flex items-center space-x-3 mb-2">
                              {deal.deal_price && (
                                <span className="text-xl font-bold text-green-600">${deal.deal_price}</span>
                              )}
                              {deal.original_price && deal.original_price !== deal.deal_price && (
                                <span className="text-lg text-gray-500 line-through">${deal.original_price}</span>
                              )}
                              {deal.discount_percentage && (
                                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                                  {deal.discount_percentage}% OFF
                                </span>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          {deal.description && <p className="text-gray-700 mb-3 line-clamp-3">{deal.description}</p>}

                          {/* Meta Info */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{deal.uploader_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{format(new Date(deal.created_at), "MMM d, yyyy")}</span>
                            </div>
                            {deal.category && (
                              <div className="flex items-center space-x-1">
                                <Tag className="w-4 h-4" />
                                <span className="capitalize">{deal.category}</span>
                              </div>
                            )}
                            {deal.expires_at && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Expires {format(new Date(deal.expires_at), "MMM d")}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-4 mt-3">
                            {deal.website_url && (
                              <a
                                href={deal.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                {deal.website_name || "View Deal"}
                              </a>
                            )}
                            {(user?.role === "admin" || user?.id === deal.user_id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDeal(deal.id)}
                                loading={deletingDealId === deal.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Deal Image */}
                        {deal.image_url && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={deal.image_url || "/placeholder.svg"}
                              alt={deal.title}
                              className="w-32 h-24 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
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

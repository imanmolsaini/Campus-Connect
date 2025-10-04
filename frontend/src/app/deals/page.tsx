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
import { PlusCircle, Search, ExternalLink, Calendar, DollarSign, Trash2, Clock, Tag, User, Percent } from "lucide-react"
import { format, isAfter } from "date-fns"
import { VotingButtons } from "@/components/ui/VotingButtons"

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
      if (response.success && response.data) {
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Deals and Coupons</h1>
              </div>
              <p className="text-gray-600 text-lg">Share and discover the best deals online</p>
            </div>
            {user && (
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {showAddForm ? "Hide Form" : "Post Deal"}
              </Button>
            )}
          </div>
        </div>

        {showAddForm && user && (
          <Card className="border-2 border-green-100 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Post a New Deal</h2>
            </div>
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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

        <Card className="border-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-gray-900">All Deals</h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {deals.length} {deals.length === 1 ? "deal" : "deals"}
          </span>
        </div>

        <div className="space-y-6">
          {deals.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-12 text-center border-2 border-dashed border-gray-300">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-700 mb-2">No deals found</p>
              <p className="text-gray-500">Be the first to post one!</p>
            </div>
          ) : (
            deals.map((deal) => {
              const isExpired = deal.expires_at && isAfter(new Date(), new Date(deal.expires_at))

              return (
                <div key={deal.id} className="group">
                  <Card
                    className={`p-6 border-2 border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg bg-white ${
                      isExpired ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex space-x-6">
                      <VotingButtons
                        upvotes={deal.upvotes || 0}
                        downvotes={deal.downvotes || 0}
                        userVote={deal.user_vote ?? null}
                        onVote={(voteType) => handleVote(deal.id, voteType)}
                        disabled={!user}
                        loading={votingDealId === deal.id}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                              {deal.title}
                              {isExpired && (
                                <span className="ml-2 text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                  Expired
                                </span>
                              )}
                            </h3>

                            {(deal.original_price || deal.deal_price) && (
                              <div className="flex items-center gap-4 mb-4">
                                {deal.deal_price && (
                                  <span className="text-3xl font-bold text-green-600">${deal.deal_price}</span>
                                )}
                                {deal.original_price && deal.original_price !== deal.deal_price && (
                                  <span className="text-xl text-gray-400 line-through">${deal.original_price}</span>
                                )}
                                {deal.discount_percentage && (
                                  <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                                    <Percent className="w-4 h-4" />
                                    <span>{deal.discount_percentage}% OFF</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {deal.description && (
                              <p className="text-gray-700 mb-4 line-clamp-2 text-base leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {deal.description}
                              </p>
                            )}

                            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{deal.uploader_name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{format(new Date(deal.created_at), "MMM d, yyyy")}</span>
                              </div>
                              {deal.category && (
                                <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                                  <Tag className="w-4 h-4 text-blue-600" />
                                  <span className="capitalize text-blue-700 font-medium">{deal.category}</span>
                                </div>
                              )}
                              {deal.expires_at && !isExpired && (
                                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">
                                  <Calendar className="w-4 h-4 text-orange-600" />
                                  <span className="text-orange-700 font-medium">
                                    Expires {format(new Date(deal.expires_at), "MMM d")}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              {deal.website_url && (
                                <a
                                  href={deal.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {deal.website_name || "View Deal"}
                                </a>
                              )}
                              {(user?.role === "admin" || user?.id === deal.user_id) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDeal(deal.id)}
                                  loading={deletingDealId === deal.id}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {deal.image_url && (
                            <div className="flex-shrink-0">
                              <img
                                src={deal.image_url || "/placeholder.svg"}
                                alt={deal.title}
                                className="w-40 h-32 object-cover rounded-xl border-2 border-gray-200 group-hover:border-green-300 transition-all duration-300 shadow-md"
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
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, TrendingUp, TrendingDown, ExternalLink, Tag, User, Clock } from "lucide-react"

interface Deal {
  id: string
  title: string
  description: string
  originalPrice?: number
  dealPrice?: number
  discountPercentage?: number
  websiteUrl?: string
  websiteName?: string
  category: string
  imageUrl?: string
  uploader: string
  createdAt: string
  upvotes: number
  downvotes: number
  userVote?: "up" | "down"
}

const SAMPLE_DEALS: Deal[] = [
  {
    id: "1",
    title:
      "Gigabyte Windforce OC RTX 5070 $1125, RTX 5080 $2190, RTX 5090 $4549 + Shipping from $14 (Bank Transfer Prices)",
    description:
      "$1125 Gigabyte NVIDIA GeForce RTX 5070 WINDFORCE OC 12GB GDDR7 Graphics Card $2190 Gigabyte NVIDIA GeForce RTX 5080 WINDFORCE OC 16GB GDDR7 Graphics Card $4549 Gigabyte NVIDIA GeForce RTX 5090 ...",
    originalPrice: 1299,
    dealPrice: 1125,
    discountPercentage: 13,
    websiteUrl: "https://notbadtech.co.nz",
    websiteName: "NotBadTech",
    category: "Computing",
    imageUrl: "/placeholder.svg?height=96&width=128&text=Graphics+Card",
    uploader: "inthiseconomy",
    createdAt: "2025-01-11T19:18:00Z",
    upvotes: 5,
    downvotes: 0,
  },
  {
    id: "2",
    title: "LONG RUNNING Free Bitwarden Family Premium Accounts if Your Employer has an Enterprise Account",
    description:
      "I think Bitwarden is the leading password manager by far, and if your company has an enterprise account, then you can get a free Family account which grants up to 6 premium users as well as vaults ...",
    websiteUrl: "https://bitwarden.com",
    websiteName: "bitwarden.com",
    category: "Computing",
    imageUrl: "/placeholder.svg?height=96&width=128&text=Bitwarden",
    uploader: "danvelopment",
    createdAt: "2025-01-07T09:49:00Z",
    upvotes: 5,
    downvotes: 0,
  },
  {
    id: "3",
    title:
      "Lumi Tripod Stand $2.99, Monitor Riser Dark Walnut $9, 1200x750mm Wood Table Top $28.99 & More + Del. ($0 C&C)",
    description:
      "Looks like the prices on clearance items are back again to lowest. Same as Previous Deal Product Discount Price Original Price Lumi Tripod Stand $16.01 off $2.99 $19.00 ...",
    originalPrice: 19.0,
    dealPrice: 2.99,
    discountPercentage: 84,
    websiteUrl: "https://computerlounge.co.nz",
    websiteName: "Computer Lounge",
    category: "Computing",
    imageUrl: "/placeholder.svg?height=96&width=128&text=Computer+Accessories",
    uploader: "ace310",
    createdAt: "2025-01-07T16:17:00Z",
    upvotes: 5,
    downvotes: 0,
  },
]

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

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(SAMPLE_DEALS)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("new")

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || deal.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === "hot") {
      return b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    } else if (sortBy === "top") {
      return b.upvotes - a.upvotes
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleVote = (dealId: string, voteType: "up" | "down") => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id === dealId) {
          const newDeal = { ...deal }

          // Remove previous vote if exists
          if (deal.userVote === "up") {
            newDeal.upvotes -= 1
          } else if (deal.userVote === "down") {
            newDeal.downvotes -= 1
          }

          // Add new vote if different from previous
          if (deal.userVote !== voteType) {
            if (voteType === "up") {
              newDeal.upvotes += 1
            } else {
              newDeal.downvotes += 1
            }
            newDeal.userVote = voteType
          } else {
            newDeal.userVote = undefined
          }

          return newDeal
        }
        return deal
      }),
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " - " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Computing » Deals and Coupons</h1>
            </div>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Post Deal
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button variant={sortBy === "new" ? "default" : "outline"} onClick={() => setSortBy("new")}>
            deals
          </Button>
          <Button variant="outline" onClick={() => setSortBy("new")}>
            new
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="new">New</option>
                <option value="hot">Hot</option>
                <option value="top">Top Rated</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Deals List */}
        <div className="space-y-4">
          {sortedDeals.map((deal) => (
            <Card key={deal.id} className="p-4">
              <div className="flex space-x-4">
                {/* Voting */}
                <div className="flex flex-col items-center space-y-1 min-w-[60px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(deal.id, "up")}
                    className={`p-1 ${
                      deal.userVote === "up" ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-green-600"
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                  </Button>
                  <span className="text-sm font-medium text-gray-700">{deal.upvotes - deal.downvotes}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(deal.id, "down")}
                    className={`p-1 ${
                      deal.userVote === "down" ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-red-600"
                    }`}
                  >
                    <TrendingDown className="w-5 h-5" />
                  </Button>
                </div>

                {/* Deal Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2 cursor-pointer">
                        {deal.title}
                      </h3>

                      {/* Price Info */}
                      {(deal.originalPrice || deal.dealPrice) && (
                        <div className="flex items-center space-x-3 mb-2">
                          {deal.dealPrice && (
                            <span className="text-xl font-bold text-green-600">${deal.dealPrice}</span>
                          )}
                          {deal.originalPrice && deal.originalPrice !== deal.dealPrice && (
                            <span className="text-lg text-gray-500 line-through">${deal.originalPrice}</span>
                          )}
                          {deal.discountPercentage && (
                            <Badge variant="destructive">{deal.discountPercentage}% OFF</Badge>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-gray-700 mb-3 line-clamp-3">{deal.description}</p>

                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span className="text-blue-600 font-medium">{deal.uploader}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(deal.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-4 h-4" />
                          <Badge variant="secondary" className="text-blue-600">
                            {deal.category}
                          </Badge>
                        </div>
                        {deal.websiteName && <span className="text-blue-600">% {deal.websiteName}</span>}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-4">
                        {deal.websiteUrl && (
                          <a
                            href={deal.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {deal.websiteName || "View Deal"}
                          </a>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">6 comments</span>
                      </div>
                    </div>

                    {/* Deal Image */}
                    {deal.imageUrl && (
                      <div className="ml-4 flex-shrink-0">
                        <img
                          src={deal.imageUrl || "/placeholder.svg"}
                          alt={deal.title}
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

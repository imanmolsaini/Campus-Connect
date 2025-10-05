"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { dealAPI } from "@/services/api"
import type { Deal } from "@/types"
import { DollarSign, ExternalLink, Clock, X, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface DealNotificationsProps {
  onClose: () => void
  onMarkAsSeen?: () => void
}

export const DealNotifications: React.FC<DealNotificationsProps> = ({ onClose, onMarkAsSeen }) => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRecentDeals()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const loadRecentDeals = async () => {
    setLoading(true)
    try {
      const response = await dealAPI.getDeals({
        sort: "new",
        limit: 10,
      })
      if (response.success && response.data) {
        const readDealsStored = localStorage.getItem("readDealIds")
        const readDealIds = readDealsStored ? new Set(JSON.parse(readDealsStored)) : new Set()
        const unreadDeals = response.data.deals.filter((deal) => !readDealIds.has(deal.id))
        setDeals(unreadDeals)
      }
    } catch (error) {
      console.error("Failed to load recent deals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = (dealId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    // Add deal to read list in localStorage
    const readDealsStored = localStorage.getItem("readDealIds")
    const readDealIds = readDealsStored ? new Set(JSON.parse(readDealsStored)) : new Set()
    readDealIds.add(dealId)
    localStorage.setItem("readDealIds", JSON.stringify(Array.from(readDealIds)))

    // Remove from displayed deals
    setDeals(deals.filter((deal) => deal.id !== dealId))

    // Notify parent to update badge count
    onMarkAsSeen?.()
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Recent Deals</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notifications"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No unread deals</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {deals.map((deal) => (
              <div key={deal.id} className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{deal.title}</h4>

                    {deal.deal_price && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">${deal.deal_price}</span>
                        {deal.discount_percentage && (
                          <span className="text-xs font-semibold bg-red-500 text-white px-2 py-0.5 rounded">
                            {deal.discount_percentage}% OFF
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}</span>
                    </div>

                    {deal.website_url && (
                      <a
                        href={deal.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {deal.website_name || "View Deal"}
                      </a>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleMarkAsRead(deal.id, e)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Mark as read"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <Link
          href="/deals"
          onClick={onClose}
          className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All Deals
        </Link>
      </div>
    </div>
  )
}

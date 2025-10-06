"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import Image from "next/image"
import {
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Upload,
  Star,
  Users,
  QuoteIcon,
  DollarSign,
  Briefcase,
  Calendar,
  Bell,
} from "lucide-react"
import { DealNotifications } from "@/components/ui/DealNotifications"
import { dealAPI } from "@/services/api"

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unseenCount, setUnseenCount] = useState(0)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    if (user) {
      checkForNewDeals()
      // Poll for new deals every 30 seconds
      const interval = setInterval(checkForNewDeals, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const checkForNewDeals = async () => {
    try {
      const response = await dealAPI.getDeals({
        sort: "new",
        limit: 10,
      })
      if (response.success && response.data) {
        const readDealsStored = localStorage.getItem("readDealIds")
        const readDealIds = readDealsStored ? new Set(JSON.parse(readDealsStored)) : new Set()

        // Count deals that haven't been marked as read
        const unreadDeals = response.data.deals.filter((deal) => !readDealIds.has(deal.id))
        setUnseenCount(unreadDeals.length)
      }
    } catch (error) {
      console.error("Failed to check for new deals:", error)
    }
  }

  const handleMarkAsSeen = () => {
    // Recalculate the unseen count
    checkForNewDeals()
  }

  const navigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: BookOpen },
        { name: "Notes", href: "/upload", icon: Upload },
        { name: "Courses", href: "/courses", icon: BookOpen },
        { name: "Reviews", href: "/reviews", icon: Star },
        { name: "Lecturers", href: "/lecturers", icon: Users },
        { name: "Quotes", href: "/quotes", icon: QuoteIcon },
        { name: "Deals", href: "/deals", icon: DollarSign },
        { name: "Jobs/Voluntary", href: "/jobs", icon: Briefcase },
        { name: "Events", href: "/events", icon: Calendar },
      ]
    : []

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 backdrop-blur-lg border-b border-blue-500/20 shadow-lg">
      <div className="max-w-7xl pl-6 pr-4 sm:pl-8 sm:pr-6 lg:pl-12 lg:pr-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                <Image src="/campus-icon.png" alt="Campus Connect Icon" width={32} height={32} className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-white whitespace-nowrap">Campus Connect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 backdrop-blur-sm"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unseenCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {unseenCount > 9 ? "9+" : unseenCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <DealNotifications onClose={() => setShowNotifications(false)} onMarkAsSeen={handleMarkAsSeen} />
                  )}
                </div>

                <div className="hidden md:flex items-center space-x-2">
                  <User className="w-4 h-4 text-white/80" />
                  <span className="text-sm text-white/90">{user.name}</span>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      Admin User
                    </span>
                  )}
                  {!user.verified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400/20 text-yellow-100 backdrop-blur-sm">
                      Unverified
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-white/5 backdrop-blur-lg rounded-b-lg">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              {user && (
                <div className="pt-2 border-t border-white/20">
                  <div className="px-3 py-2 text-sm text-white/70">Signed in as {user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-white/90 hover:text-red-300 hover:bg-white/10 w-full text-left transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { User, LogOut, Menu, X, BookOpen, Upload, Star, Users, QuoteIcon, DollarSign, Briefcase } from "lucide-react" // Added Briefcase for jobs

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: BookOpen },
        { name: "Upload Notes", href: "/upload", icon: Upload },
        { name: "Courses", href: "/courses", icon: BookOpen }, // Added Courses link
        { name: "Reviews", href: "/reviews", icon: Star },
        { name: "Lecturers", href: "/lecturers", icon: Users }, // Changed from Feedback to Lecturers
        { name: "Quotes", href: "/quotes", icon: QuoteIcon }, // New Quotes link
        { name: "Deals", href: "/deals", icon: DollarSign }, // Added Deals navigation
        { name: "Jobs/Voluntary", href: "/jobs", icon: Briefcase }, // Added Jobs/Voluntary navigation
      ]
    : []

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
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
                  <Button size="sm" className="bg-white text-blue-700 hover:bg-white/90 shadow-lg">
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

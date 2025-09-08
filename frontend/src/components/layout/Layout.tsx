"use client"

import type React from "react"
import { Header } from "./Header"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>
      <div className="h-32 bg-gradient-to-t from-primary-50/20 to-transparent"></div>
    </div>
  )
}

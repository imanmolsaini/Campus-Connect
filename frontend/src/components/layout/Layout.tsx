"use client"

import type React from "react"
import { Header } from "./Header"
import ParallaxBackground from "../ui/ParallaxBackground"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      <ParallaxBackground />
      <div className="relative z-10 bg-white/80 backdrop-blur-sm min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</main>
        <div className="h-32 bg-gradient-to-t from-primary-50/20 to-transparent"></div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"

export default function ParallaxBackground() {
  const featureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const feature = featureRef.current
    if (!feature) return

    // Get initial zoom level
    const computedStyle = window.getComputedStyle(feature)
    const backgroundSize = computedStyle.backgroundSize
    const zoom = Number.parseFloat(backgroundSize) / 100
    const size = zoom * feature.offsetWidth

    const handleScroll = () => {
      const fromTop = window.scrollY
      const newSize = size - fromTop / 3

      if (newSize > feature.offsetWidth) {
        const blur = 0 + fromTop / 100
        const opacity = 1 - (fromTop / document.documentElement.scrollHeight) * 1.3

        feature.style.backgroundSize = `${newSize}px`
        feature.style.filter = `blur(${blur}px)`
        feature.style.opacity = Math.max(0, opacity).toString()
      }
    }

    // Browser detection for fallback
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)

    if (!isChrome && !isSafari) {
      // Add opaque overlay for non-Chrome/Safari browsers
      const opaqueDiv = document.createElement("div")
      opaqueDiv.className = "opaque absolute inset-0 bg-black pointer-events-none"
      feature.appendChild(opaqueDiv)

      const handleScrollOpaque = () => {
        const opacity = 0 + window.scrollY / 5000
        opaqueDiv.style.opacity = Math.min(1, opacity).toString()
      }

      window.addEventListener("scroll", handleScrollOpaque)

      return () => {
        window.removeEventListener("scroll", handleScrollOpaque)
        if (opaqueDiv.parentNode) {
          opaqueDiv.parentNode.removeChild(opaqueDiv)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div
      ref={featureRef}
      className="feature fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/background.jpg)",
        backgroundSize: "120%",
      }}
    />
  )
}

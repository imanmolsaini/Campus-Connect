"use client"
import Link from "next/link"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import RotatingText from "@/components/ui/RotatingText"
import { useAuth } from "@/contexts/AuthContext"
import {
  BookOpen,
  Upload,
  Star,
  MessageSquare,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  CheckCircle,
  Quote,
} from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()

  const rotatingPhrases = [
    "share notes with fellow students",
    "review the available courses",
    "connect with fellow students",
    "check best deals available",
    "build your academic success together",
  ]

  const features = [
    {
      icon: BookOpen,
      title: "Share Study Notes",
      description: "Upload and access lecture notes, assignments, and study materials from fellow AUT students.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Star,
      title: "Course Reviews",
      description:
        "Read honest reviews about courses, difficulty levels, and workload from students who have taken them.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: MessageSquare,
      title: "Lecturer Feedback",
      description: "Provide anonymous feedback about lecturers to help improve the learning experience.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with fellow AUT students and build a supportive academic community.",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with secure authentication and privacy controls.",
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Upload,
      title: "Easy Uploads",
      description: "Simple and intuitive interface for uploading and organizing your study materials.",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      program: "Computer Science",
      year: "3rd Year",
      quote:
        "Campus Connect has been a game-changer for my studies. The shared notes helped me ace my algorithms course!",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      program: "Business Administration",
      year: "2nd Year",
      quote: "The course reviews are incredibly helpful for planning my semester. I know exactly what to expect now.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      program: "Engineering",
      year: "4th Year",
      quote: "Love how easy it is to connect with other students. Found my study group through this platform!",
      rating: 5,
    },
  ]

  const benefits = [
    {
      icon: Award,
      title: "Improve Your Grades",
      description: "Access high-quality study materials and learn from top-performing students",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Find exactly what you need without spending hours searching for resources",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: CheckCircle,
      title: "Make Better Decisions",
      description: "Choose courses and lecturers based on real student experiences and reviews",
      gradient: "from-emerald-500 to-green-500",
    },
  ]

  return (
    <Layout>
      <div className="space-y-20">
        <div className="relative overflow-hidden gradient-bg rounded-3xl p-12 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-secondary-400/5"></div>
          <div className="absolute top-10 right-10 w-20 h-20 bg-primary-200/30 rounded-full floating-element"></div>
          <div
            className="absolute bottom-10 left-10 w-16 h-16 bg-secondary-200/30 rounded-full floating-element"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="relative text-center space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <div className="feature-badge">
                <Sparkles className="w-4 h-4" />
                "Created by AUT Students, Inspired by AUT Students ❤️"
              </div>
              <h1 className="text-hero">
                Welcome to <span className="text-blue-gradient">Campus Connect NZ</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                The ultimate platform for AUT University students to{" "}
                <RotatingText
                  texts={rotatingPhrases}
                  rotationInterval={3000}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  elementLevelClassName="text-blue-600 font-semibold"
                />
                .
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link href="/dashboard" className="group">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 glow-effect">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="group">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 glow-effect">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto text-lg px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {!user && (
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200">
                <Shield className="w-4 h-4 text-primary-600" />
                Only available to AUT University students with @autuni.ac.nz email addresses
              </div>
            )}
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Why choose <span className="text-blue-gradient">Campus Connect?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful AUT students who are already benefiting from our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center space-y-4 group">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${benefit.gradient} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-blue-soft`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything you need for <span className="text-blue-gradient">academic success</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover powerful features designed specifically for AUT students to excel in their studies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="card-feature group">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-medium`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What <span className="text-blue-gradient">students</span> are saying
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real feedback from AUT students who are using Campus Connect to excel in their studies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card group">
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-primary-400 group-hover:text-primary-600 transition-colors" />
                  <p className="text-gray-700 leading-relaxed italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.program} • {testimonial.year}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!user && (
          <div className="text-center space-y-8 bg-gradient-to-br from-gray-50 to-primary-50 rounded-3xl p-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-6 right-6 w-12 h-12 bg-primary-200/40 rounded-full floating-element"></div>
            <div
              className="absolute bottom-6 left-6 w-8 h-8 bg-secondary-200/40 rounded-full floating-element"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="relative space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Ready to <span className="text-blue-gradient">transform</span> your studies?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Join the Campus Connect community today and unlock access to thousands of study materials, course
                insights, and connections with fellow AUT students.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="group">
                <Button size="lg" className="text-lg px-8 py-4 glow-effect">
                  Create Your Account
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Free for all AUT students
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

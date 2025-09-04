"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { authAPI } from "@/services/api"

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>()

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true)
    try {
      const response = await authAPI.requestPasswordReset(data.email)

      if (response.success) {
        setSubmitted(true)
        toast.success("Password reset link sent to your email!")
      } else {
        toast.error(response.message || "Failed to send reset link")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset link")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                If an account with that email exists, we've sent you a password reset link.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-4">
                <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">
                  Try Different Email
                </Button>
                <Link href="/login" className="block text-center text-sm text-primary-600 hover:text-primary-500">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="text-gray-600 mt-2">Enter your AUT email address and we'll send you a reset link</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="AUT Email Address"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@(autuni\.ac\.nz|aut\.ac\.nz)$/,
                  message: "Please enter a valid AUT email address (@autuni.ac.nz or @aut.ac.nz)",
                },
              })}
              error={errors.email?.message}
              placeholder="your.email@autuni.ac.nz"
            />

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500">
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

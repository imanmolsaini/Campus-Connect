'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { LoginForm } from '@/types';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      
      if (response.success && response.data) {
        login(response.data.token, response.data.user);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600 mt-2">
              Welcome back to Campus Connect NZ
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              error={errors.email?.message}
              placeholder="your.email@autuni.ac.nz"
            />

            <Input
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
              })}
              error={errors.password?.message}
              placeholder="Enter your password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </Link>

            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

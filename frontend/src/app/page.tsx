'use client';

import React from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Upload, Star, MessageSquare, Users, Shield } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Share Study Notes',
      description: 'Upload and access lecture notes, assignments, and study materials from fellow AUT students.',
    },
    {
      icon: Star,
      title: 'Course Reviews',
      description: 'Read honest reviews about courses, difficulty levels, and workload from students who have taken them.',
    },
    {
      icon: MessageSquare,
      title: 'Lecturer Feedback',
      description: 'Provide anonymous feedback about lecturers to help improve the learning experience.',
    },
    {
      icon: Users,
      title: 'Student Community',
      description: 'Connect with fellow AUT students and build a supportive academic community.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with secure authentication and privacy controls.',
    },
    {
      icon: Upload,
      title: 'Easy Uploads',
      description: 'Simple and intuitive interface for uploading and organizing your study materials.',
    },
  ];

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Welcome to{' '}
              <span className="text-primary-600">Campus Connect NZ</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The ultimate platform for AUT University students to share notes, review courses, 
              and connect with fellow students. Build your academic success together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {!user && (
            <p className="text-sm text-gray-500">
              Only available to AUT University students with @autuni.ac.nz email addresses
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-primary-600 rounded-2xl p-8 text-white text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-primary-100">Study Materials</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-primary-100">Course Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold">2000+</div>
              <div className="text-primary-100">Active Students</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center space-y-6 bg-gray-100 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to join the community?
            </h2>
            <p className="text-lg text-gray-600">
              Sign up with your AUT email address and start sharing knowledge today.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Create Your Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { courseAPI, noteAPI, reviewAPI } from '@/services/api';
import { Course, Note, Review } from '@/types';
import { BookOpen, Upload, Star, MessageSquare, Download, Eye, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [coursesRes, notesRes, userNotesRes, userReviewsRes] = await Promise.all([
        courseAPI.getCourses({ limit: 6 } as any),
        noteAPI.getNotes({ limit: 6 } as any),
        noteAPI.getUserNotes(),
        reviewAPI.getUserReviews(),
      ]);

      if (coursesRes.success) setCourses(coursesRes.data.courses);
      if (notesRes.success) setRecentNotes(notesRes.data.notes);
      if (userNotesRes.success) setUserNotes(userNotesRes.data.notes);
      if (userReviewsRes.success) setUserReviews(userReviewsRes.data.reviews);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: 'Notes Uploaded',
      value: userNotes.length,
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Reviews Written',
      value: userReviews.length,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Total Downloads',
      value: userNotes.reduce((sum, note) => sum + note.download_count, 0),
      icon: Download,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Available Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening in your academic community
            </p>
          </div>
          
          {!user?.verified && (
            <div className="mt-4 md:mt-0">
              <Link href="/verify-email">
                <Button variant="outline" size="sm">
                  Verify Email
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/upload">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Upload Notes
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
            <Link href="/reviews">
              <Button variant="outline" className="w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            </Link>
            <Link href="/lecturer-feedback">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Give Feedback
              </Button>
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Notes</h2>
              <Link href="/notes">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotes.slice(0, 5).map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {note.course_code} • {note.uploader_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Download className="w-3 h-3" />
                    <span>{note.download_count}</span>
                  </div>
                </div>
              ))}
              {recentNotes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No notes available yet</p>
              )}
            </div>
          </Card>

          {/* Popular Courses */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Popular Courses</h2>
              <Link href="/courses">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {course.code} - {course.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Year {course.year} • {course.review_count} reviews
                    </p>
                  </div>
                  {/* Safely render avg_rating */}
                  {typeof course.avg_rating === 'number' && course.avg_rating > 0 ? (
                    <div className="flex items-center space-x-1 text-xs text-yellow-600">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{course.avg_rating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No ratings</span>
                  )}
                </div>
              ))}
              {courses.length === 0 && (
                <p className="text-gray-500 text-center py-4">No courses available yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        {(userNotes.length > 0 || userReviews.length > 0) && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {userNotes.slice(0, 3).map((note) => (
                <div key={note.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Uploaded "{note.title}"
                    </p>
                    <p className="text-xs text-gray-500">
                      {note.course_code} • {format(new Date(note.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {note.download_count} downloads
                  </div>
                </div>
              ))}
              
              {userReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Reviewed {review.course_code}
                    </p>
                    <p className="text-xs text-gray-500">
                      {review.rating}/5 stars • {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { MessageSquare } from 'lucide-react';

export default function LecturerFeedbackPage() {
  const { loading } = useRequireAuth(true); // Require authentication and verification

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lecturer Feedback</h1>
          <p className="text-gray-600 mt-2">
            Provide anonymous feedback for your lecturers to help improve teaching quality.
          </p>
        </div>

        <Card className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Feedback Section Coming Soon!
          </h3>
          <p className="text-gray-600">
            This page is under development. You'll soon be able to submit and view lecturer feedback here.
          </p>
        </Card>
      </div>
    </Layout>
  );
}

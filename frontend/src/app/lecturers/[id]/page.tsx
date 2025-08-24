'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { lecturerAPI, lecturerFeedbackAPI, courseAPI } from '@/services/api';
import { Lecturer, LecturerFeedback, Quote, LecturerFeedbackForm, Course } from '@/types';
import { Star, MessageSquare, QuoteIcon, BookOpen, User, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { RatingStars } from '@/components/ui/RatingStars';

export default function LecturerDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useRequireAuth(true);
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [feedback, setFeedback] = useState<LecturerFeedback[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LecturerFeedbackForm>();

  const selectedRating = watch('rating');

  useEffect(() => {
    if (id) {
      loadLecturerData(id as string);
    }
  }, [id]);

  const loadLecturerData = async (lecturerId: string) => {
    setLoadingData(true);
    try {
      const [lecturerRes, coursesRes] = await Promise.all([
        lecturerAPI.getLecturer(lecturerId),
        courseAPI.getCourses(),
      ]);

      if (lecturerRes.success && lecturerRes.data) {
        setLecturer(lecturerRes.data.lecturer);
        setFeedback(lecturerRes.data.recent_feedback);
        setQuotes(lecturerRes.data.recent_quotes);
      } else {
        toast.error(lecturerRes.message || 'Failed to load lecturer details.');
      }

      if (coursesRes.success) {
        setCourses(coursesRes.data.courses);
      }

    } catch (error) {
      console.error('Failed to load lecturer data:', error);
      toast.error('Failed to load lecturer data.');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmitFeedback = async (data: LecturerFeedbackForm) => {
    setIsSubmittingFeedback(true);
    try {
      const response = await lecturerFeedbackAPI.createFeedback({
        ...data,
        lecturer_id: lecturer?.id, // Ensure lecturer_id is passed
        rating: Number(data.rating),
        anonymous: data.anonymous || false,
        teaching_quality: data.teaching_quality ? Number(data.teaching_quality) : undefined,
        communication_rating: data.communication_rating ? Number(data.communication_rating) : undefined,
        availability_rating: data.availability_rating ? Number(data.availability_rating) : undefined,
      });

      if (response.success && response.data) {
        toast.success('Feedback submitted successfully!');
        reset();
        setShowFeedbackForm(false);
        if (lecturer?.id) loadLecturerData(lecturer.id); // Reload data
      } else {
        toast.error(response.message || 'Failed to submit feedback.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  if (!lecturer) {
    return (
      <Layout>
        <Card className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Lecturer not found
          </h3>
          <p className="text-gray-600">
            The lecturer you are looking for does not exist.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Lecturer Profile Header */}
        <Card className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-8">
          <img
            src={lecturer.profile_image_url || '/placeholder.svg?height=160&width=120&query=default lecturer profile'}
            alt={lecturer.name}
            className="w-[120px] h-[160px] object-cover rounded-md border-4 border-primary-200 shadow-md"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {lecturer.name}
            </h1>
            {lecturer.description && (
              <p className="text-gray-700 text-lg mb-4">
                {lecturer.description}
              </p>
            )}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-gray-600 text-sm">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-primary-500" />
                <span>{lecturer.feedback_count} Feedback</span>
              </div>
              <div className="flex items-center space-x-1">
                <QuoteIcon className="w-4 h-4 text-purple-500" />
                <span>{lecturer.quote_count} Quotes</span>
              </div>
              {typeof lecturer.avg_feedback_rating === 'number' && lecturer.avg_feedback_rating > 0 ? (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <RatingStars rating={lecturer.avg_feedback_rating} size={16} />
                  <span>{lecturer.avg_feedback_rating.toFixed(1)} Avg. Rating</span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">No feedback yet</span>
              )}
            </div>
          </div>
        </Card>

        {/* Feedback Submission */}
        <div className="flex justify-end">
          <Button onClick={() => setShowFeedbackForm(!showFeedbackForm)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {showFeedbackForm ? 'Hide Feedback Form' : 'Give Feedback'}
          </Button>
        </div>

        {showFeedbackForm && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback for {lecturer.name}</h2>
            <form onSubmit={handleSubmit(onSubmitFeedback)} className="space-y-6">
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Rating (1-5 Stars)
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`cursor-pointer ${selectedRating && star <= selectedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      size={24}
                      onClick={() => setValue('rating', star, { shouldValidate: true })}
                    />
                  ))}
                </div>
                <input type="hidden" {...register('rating', { required: 'Overall rating is required', min: 1, max: 5 })} />
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                )}
              </div>

              {/* Additional Ratings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Teaching Quality (1-5)"
                  type="number"
                  {...register('teaching_quality', { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.teaching_quality?.message}
                  placeholder="e.g., 4"
                />
                <Input
                  label="Communication (1-5)"
                  type="number"
                  {...register('communication_rating', { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.communication_rating?.message}
                  placeholder="e.g., 5"
                />
                <Input
                  label="Availability (1-5)"
                  type="number"
                  {...register('availability_rating', { min: 1, max: 5, valueAsNumber: true })}
                  error={errors.availability_rating?.message}
                  placeholder="e.g., 3"
                />
              </div>

              {/* Course Selection (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Course (Optional)
                </label>
                <select
                  {...register('course_id')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.course_id.message}</p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  {...register('comment', { maxLength: { value: 1000, message: 'Comment too long' } })}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Share your thoughts on the lecturer..."
                />
                {errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                )}
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center">
                <input
                  id="anonymous-feedback"
                  type="checkbox"
                  {...register('anonymous')}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="anonymous-feedback" className="ml-2 block text-sm text-gray-900">
                  Post anonymously
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowFeedbackForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmittingFeedback}>
                  Submit Feedback
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Recent Feedback */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8">Recent Feedback</h2>
        <div className="space-y-6">
          {feedback.length === 0 ? (
            <Card className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No feedback yet. Be the first to provide some!</p>
            </Card>
          ) : (
            feedback.map((f) => (
              <Card key={f.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <RatingStars rating={f.rating} size={20} />
                    <span className="text-lg font-semibold text-gray-900">{f.rating}/5</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(f.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {f.course_name && (
                  <h3 className="text-md font-medium text-gray-800 mb-2">
                    Related to: {f.course_code} - {f.course_name}
                  </h3>
                )}
                {f.comment && (
                  <p className="text-gray-700 mb-3">{f.comment}</p>
                )}
                <div className="text-sm text-gray-600 flex items-center space-x-4">
                  <span>By {f.anonymous ? 'Anonymous' : f.reviewer_name}</span>
                  {f.teaching_quality && (
                    <span>• Teaching Quality: {f.teaching_quality}/5</span>
                  )}
                  {f.communication_rating && (
                    <span>• Communication: {f.communication_rating}/5</span>
                  )}
                  {f.availability_rating && (
                    <span>• Availability: {f.availability_rating}/5</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Recent Quotes */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8">Recent Quotes</h2>
        <div className="space-y-6">
          {quotes.length === 0 ? (
            <Card className="text-center py-8">
              <QuoteIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No quotes found for this lecturer yet.</p>
            </Card>
          ) : (
            quotes.map((quote) => (
              <Card key={quote.id} className="p-6">
                <blockquote className="text-xl italic text-gray-800 mb-3 relative pl-8">
                  <span className="absolute left-0 top-0 text-primary-400 text-5xl font-serif leading-none">“</span>
                  {quote.quote_text}
                </blockquote>
                <div className="text-sm text-gray-600 text-right">
                  — {quote.lecturer_name}
                  {quote.context && <span className="ml-2">({quote.context})</span>}
                  <span className="ml-2">• {format(new Date(quote.created_at), 'MMM d, yyyy')}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

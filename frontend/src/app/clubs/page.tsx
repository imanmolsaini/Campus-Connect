'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { clubAPI } from '@/services/api';
import { Club } from '@/types';
import { Users, PlusCircle, Search, Link as LinkIcon, MapPin, Calendar, Clock } from 'lucide-react';
import { Trash2 } from "lucide-react";

// UPDATED: Refactored meeting_date to club_date and meeting_time to club_time
interface ClubForm {
  name: string;
  description: string;
  location?: string;
  club_date?: string;
  club_time?: string;
  image_url?: string;
  join_link?: string;
}

export default function ClubsPage() {
  const { user, loading } = useRequireAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClubForm>();

  useEffect(() => {
    if (user) {
      loadClubs();
    }
  }, [user]);

  const loadClubs = async () => {
    try {
      const res = await clubAPI.getClubs();
      if (res.success && res.data?.clubs) {
        setClubs(res.data.clubs);
      }
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmitClub = async (data: ClubForm) => {
    setIsSubmitting(true);
    try {
      const response = await clubAPI.createClub(data);
      if (response.success) {
        toast.success("Club created successfully!");
        reset();
        setShowAddForm(false);
        loadClubs();
      } else {
        toast.error(response.message || "Failed to create club.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create club.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (club.description && club.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Explore Clubs
            </h1>
            <p className="text-gray-600 mt-2">
              Join communities that match your interests
            </p>
          </div>

          <div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddForm ? "Hide Form" : "Create Club"}
            </Button>
          </div>
        </div>

        {/* Create Club Form */}
        {showAddForm && user && (

          <Card className="w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a New Club</h2>
            <form onSubmit={handleSubmit(onSubmitClub)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Club Name *"
                    {...register("name", { required: "Club name is required" })}
                    error={errors.name?.message}
                    placeholder="e.g., Tech Enthusiasts Club"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Description *</label>
                  <textarea
                    {...register("description", { required: "Club description is required" })}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe your club, its purpose, activities, and who should join..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                {/* Club Location field */}
                <div>
                  <Input
                    label="Club Location"
                    {...register("location")}
                    error={errors.location?.message}
                    placeholder="e.g., WZ Building, Room 260"
                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* UPDATED: Club Date field */}
                <div>
                  <Input
                    label="Club Date"
                    type="date"
                    {...register("club_date")}
                    error={errors.club_date?.message}
                    icon={<Calendar className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* UPDATED: Club Time field */}
                <div>
                  <Input
                    label="Club Time"
                    type="time"
                    {...register("club_time")}
                    error={errors.club_time?.message}
                    icon={<Clock className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                {/* Link to Join field */}
                <div className="md:col-span-2">
                  <Input
                    label="Link to Join"
                    type="url"
                    {...register("join_link")}
                    error={errors.join_link?.message}
                    placeholder="https://chat.whatsapp.com/your-club-link"
                    icon={<LinkIcon className="w-4 h-4 text-gray-400" />}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Image URL"
                    type="url"
                    {...register("image_url")}
                    error={errors.image_url?.message}
                    placeholder="https://example.com/club-image.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Create Club
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search Bar */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search club name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Clubs Grid */}
        <div className="space-y-6">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="p-4 flex flex-col justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {club.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {club.description || 'No description available'}
                </p>


                {/* UPDATED: Display club location, date, and time with updated field names */}
                <div className="mt-3 space-y-1 text-sm text-gray-500">
                  {club.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{club.location}</span>
                    </div>
                  )}
                  {club.club_date && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(club.club_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {club.club_time && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{club.club_time}</span>
                    </div>
                  )}
                </div>

                {/* Display join link if available */}
                {club.join_link && (
                  <div className="mt-3">
                    <a
                      href={club.join_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Join Club
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{club.members_count || 0} members</span>
                </div>
                <Link href={`/clubs/${club.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
                {/* Delete Button - only show if user is admin or club creator */}
                {(user?.role === "admin" || user?.id === club.creator_id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this club?")) {
                        try {
                          await clubAPI.deleteClub(club.id);
                          toast.success("Club deleted!");
                          loadClubs();
                        } catch (error) {
                          toast.error("Failed to delete club.");
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {filteredClubs.length === 0 && (
            <Card className="text-center py-8 col-span-full">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">
                {searchQuery ? 'No clubs found matching your search.' : 'No clubs available yet. Be the first to create one!'}
              </p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { useAuth } from "@/contexts/AuthContext"
import { eventAPI } from "@/services/api"
import type { Event, EventForm } from "@/types"
import { PlusCircle, Search, Heart, HeartOff, MapPin, Calendar, Clock, User, Trash2, Tag } from "lucide-react"
import { format, isBefore } from "date-fns"

const EVENT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "concert", label: "Concert" },
  { value: "workshop", label: "Workshop" },
  { value: "meetup", label: "Meetup" },
  { value: "conference", label: "Conference" },
  { value: "social", label: "Social" },
  { value: "academic", label: "Academic" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
]

const SORT_OPTIONS = [
  { value: "new", label: "Newest" },
  { value: "upcoming", label: "Upcoming" },
  { value: "popular", label: "Most Popular" },
]

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("upcoming")
  const [interestingEventId, setInterestingEventId] = useState<string | null>(null)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventForm>()

  useEffect(() => {
    loadEvents()
  }, [searchTerm, selectedType, sortBy])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const response = await eventAPI.getEvents({
        search: searchTerm,
        event_type: selectedType,
        sort: sortBy,
      })
      if (response.success) {
        setEvents(response.data.events)
      }
    } catch (error) {
      console.error("Failed to load events:", error)
      toast.error("Failed to load events.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmitEvent = async (data: EventForm) => {
    setIsSubmitting(true)
    try {
      const response = await eventAPI.createEvent(data)
      if (response.success) {
        toast.success("Event created successfully!")
        reset()
        setShowAddForm(false)
        loadEvents()
      } else {
        toast.error(response.message || "Failed to create event.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create event.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInterest = async (eventId: string, interestType: "interested" | "not_interested") => {
    if (!user) {
      toast.error("Please login to mark interest in events.")
      return
    }

    setInterestingEventId(eventId)
    try {
      const response = await eventAPI.markInterest(eventId, interestType)
      if (response.success) {
        loadEvents() // Refresh to get updated interest counts
      } else {
        toast.error(response.message || "Failed to mark interest.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to mark interest.")
    } finally {
      setInterestingEventId(null)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setDeletingEventId(eventId)
    try {
      const response = await eventAPI.deleteEvent(eventId)
      if (response.success) {
        toast.success("Event deleted successfully!")
        loadEvents()
      } else {
        toast.error(response.message || "Failed to delete event.")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event.")
    } finally {
      setDeletingEventId(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
            <p className="text-gray-600 mt-2">Discover and create events happening around campus</p>
          </div>
          {user && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {showAddForm ? "Hide Form" : "Create Event"}
            </Button>
          )}
        </div>

        {/* Add Event Form */}
        {showAddForm && user && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a New Event</h2>
            <form onSubmit={handleSubmit(onSubmitEvent)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Event Name *"
                    {...register("event_name", { required: "Event name is required" })}
                    error={errors.event_name?.message}
                    placeholder="e.g., AUT Tech Meetup 2024"
                  />
                </div>

                <div>
                  <Input
                    label="Event Place *"
                    {...register("event_place", { required: "Event place is required" })}
                    error={errors.event_place?.message}
                    placeholder="e.g., WZ Building, Room 260"
                  />
                </div>

                <div>
                  <Input
                    label="Event Date & Time *"
                    type="datetime-local"
                    {...register("event_time", { required: "Event time is required" })}
                    error={errors.event_time?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                  <select
                    {...register("event_type", { required: "Event type is required" })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    {EVENT_TYPES.slice(1).map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.event_type && <p className="text-red-500 text-sm mt-1">{errors.event_type.message}</p>}
                </div>

                <div>
                  <Input
                    label="Event Location *"
                    {...register("event_location", { required: "Event location is required" })}
                    error={errors.event_location?.message}
                    placeholder="e.g., AUT City Campus, Auckland CBD"
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Image URL"
                    type="url"
                    {...register("image_url")}
                    error={errors.image_url?.message}
                    placeholder="https://example.com/event-image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                  <textarea
                    {...register("event_description")}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe your event, what attendees can expect, any requirements..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Create Event
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters and Sort */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <Card className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No events found. Be the first to create one!</p>
            </Card>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.event_time)
              const isPastEvent = isBefore(eventDate, new Date())

              return (
                <Card key={event.id} className={`p-4 ${isPastEvent ? "opacity-60" : ""}`}>
                  <div className="flex space-x-4">
                    {/* Interest Actions */}
                    <div className="flex flex-col items-center space-y-1 min-w-[80px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInterest(event.id, "interested")}
                        disabled={!user || interestingEventId === event.id}
                        className={`p-1 ${event.user_interest === "interested" ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-green-600"}`}
                      >
                        <Heart className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-medium text-gray-700">{event.interested_count || 0}</span>
                      <span className="text-xs text-gray-500">Interested</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInterest(event.id, "not_interested")}
                        disabled={!user || interestingEventId === event.id}
                        className={`p-1 ${event.user_interest === "not_interested" ? "text-red-600 bg-red-50" : "text-gray-400 hover:text-red-600"}`}
                      >
                        <HeartOff className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Event Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {event.event_name}
                            {isPastEvent && <span className="ml-2 text-sm text-gray-500">(Past Event)</span>}
                          </h3>

                          {/* Event Details */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{format(eventDate, "h:mm a")}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {event.event_place} • {event.event_location}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {event.event_description && (
                            <p className="text-gray-700 mb-3 line-clamp-3">{event.event_description}</p>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>Organized by {event.organizer_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span className="capitalize">{event.event_type}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-4 mt-3">
                            {(user?.role === "admin" || user?.id === event.user_id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                loading={deletingEventId === event.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Event Image */}
                        {event.image_url && (
                          <div className="ml-4 flex-shrink-0">
                            <img
                              src={event.image_url || "/placeholder.svg"}
                              alt={event.event_name}
                              className="w-32 h-24 object-cover rounded-lg border"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

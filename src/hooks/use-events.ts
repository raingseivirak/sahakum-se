'use client'

import { useState, useEffect } from 'react'

interface EventTranslation {
  id?: string
  language: string
  title: string
  content: string
  excerpt?: string
  metaDescription?: string
  seoTitle?: string
}

interface Event {
  id: string
  slug: string
  startDate: string
  endDate: string
  allDay: boolean
  locationType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID'
  venueName?: string | null
  address?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  virtualUrl?: string | null
  registrationEnabled: boolean
  registrationType?: 'PUBLIC' | 'MEMBERS_ONLY' | null
  registrationDeadline?: string | null
  maxCapacity?: number | null
  isFree: boolean
  price?: number | null
  currency?: string | null
  organizer?: string | null
  contactEmail?: string | null
  externalUrl?: string | null
  featuredImg?: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
    email: string
  }
  translations: EventTranslation[]
  categories: any[]
  tags: any[]
  _count?: {
    registrations: number
  }
}

interface CreateEventData {
  slug: string
  startDate: string
  endDate: string
  allDay?: boolean
  locationType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID'
  venueName?: string
  address?: string
  postalCode?: string
  city?: string
  country?: string
  virtualUrl?: string
  registrationEnabled?: boolean
  registrationType?: 'PUBLIC' | 'MEMBERS_ONLY'
  registrationDeadline?: string
  maxCapacity?: number
  isFree?: boolean
  price?: number
  currency?: string
  organizer?: string
  contactEmail?: string
  externalUrl?: string
  featuredImg?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: string
  translations: Omit<EventTranslation, 'id'>[]
  categoryIds?: string[]
  tagIds?: string[]
}

interface UpdateEventData extends Partial<CreateEventData> {}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/events')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (data: CreateEventData): Promise<Event> => {
    setError(null)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      const newEvent = await response.json()
      setEvents(prev => [newEvent, ...prev])
      return newEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateEvent = async (id: string, data: UpdateEventData): Promise<Event> => {
    setError(null)
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }

      const updatedEvent = await response.json()
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event))
      return updatedEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteEvent = async (id: string): Promise<void> => {
    setError(null)
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

      setEvents(prev => prev.filter(event => event.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getEvent = async (id: string): Promise<Event> => {
    setError(null)
    try {
      const response = await fetch(`/api/events/${id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch event')
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
  }
}

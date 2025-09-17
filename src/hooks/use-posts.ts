'use client'

import { useState, useEffect } from 'react'

interface PostTranslation {
  id?: string
  language: string
  title: string
  content: string
  excerpt?: string
  metaDescription?: string
  seoTitle?: string
}

interface Post {
  id: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  featuredImg: string | null
  createdAt: string
  updatedAt: string
  author: {
    name: string
    email: string
  }
  translations: PostTranslation[]
  categories: any[]
  tags: any[]
}

interface CreatePostData {
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: string
  featuredImg?: string
  translations: Omit<PostTranslation, 'id'>[]
}

interface UpdatePostData extends Partial<CreatePostData> {}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/posts')
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (data: CreatePostData): Promise<Post> => {
    setError(null)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const newPost = await response.json()
      setPosts(prev => [newPost, ...prev])
      return newPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updatePost = async (id: string, data: UpdatePostData): Promise<Post> => {
    setError(null)
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update post')
      }

      const updatedPost = await response.json()
      setPosts(prev => prev.map(post => post.id === id ? updatedPost : post))
      return updatedPost
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deletePost = async (id: string): Promise<void> => {
    setError(null)
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete post')
      }

      setPosts(prev => prev.filter(post => post.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getPost = async (id: string): Promise<Post> => {
    setError(null)
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch post')
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    getPost,
  }
}
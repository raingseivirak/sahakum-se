'use client'

import { useState, useEffect } from 'react'

interface CategoryTranslation {
  id: string
  language: string
  name: string
  description?: string
}

interface Category {
  id: string
  slug: string
  type: string
  parentId: string | null
  translations: CategoryTranslation[]
  parent?: {
    id: string
    slug: string
    translations: CategoryTranslation[]
  }
  children?: Category[]
  _count?: {
    contentItems: number
  }
}

interface CreateCategoryData {
  slug: string
  type: string
  parentId?: string
  translations: Omit<CategoryTranslation, 'id'>[]
}

interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async (type?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = type ? `/api/categories?type=${type}` : '/api/categories'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (data: CreateCategoryData): Promise<Category> => {
    setError(null)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const newCategory = await response.json()
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateCategory = async (id: string, data: UpdateCategoryData): Promise<Category> => {
    setError(null)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      const updatedCategory = await response.json()
      setCategories(prev => prev.map(category => category.id === id ? updatedCategory : category))
      return updatedCategory
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    setError(null)
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      setCategories(prev => prev.filter(category => category.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getCategory = async (id: string): Promise<Category> => {
    setError(null)
    try {
      const response = await fetch(`/api/categories/${id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch category')
      }
      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Helper function to build category tree
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>()
    const rootCategories: Category[] = []

    // Create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })

    // Build the tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(categoryWithChildren)
        } else {
          // Parent not found, treat as root
          rootCategories.push(categoryWithChildren)
        }
      } else {
        rootCategories.push(categoryWithChildren)
      }
    })

    return rootCategories
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    buildCategoryTree,
    categoryTree: buildCategoryTree(categories)
  }
}
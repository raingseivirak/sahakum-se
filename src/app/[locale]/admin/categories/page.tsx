'use client'

import { useState } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  TreePine,
} from "lucide-react"
import Link from "next/link"
import { useCategories } from "@/hooks/use-categories"

interface CategoriesPageProps {
  params: { locale: string }
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const fontClass = 'font-sweden'
  const { categories, loading, error, deleteCategory, categoryTree } = useCategories()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete)
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  const getTranslation = (translations: any[], language: string) => {
    return translations.find(t => t.language === language)?.name ||
           translations.find(t => t.language === 'en')?.name ||
           translations[0]?.name || 'Untitled'
  }

  const categoryTypes = ['all', 'general', 'event-type', 'recipe-type']

  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.translations.some(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesType = selectedType === 'all' || category.type === selectedType

    return matchesSearch && matchesType
  })

  // Render category tree for hierarchical view
  const renderCategoryTree = (cats: any[], level: number = 0) => {
    return cats.map(category => [
      <TableRow key={category.id}>
          <TableCell>
            <div className={`flex items-center gap-2 ${level > 0 ? `ml-${level * 4}` : ''}`}>
              {level > 0 && <TreePine className="h-4 w-4 text-muted-foreground" />}
              <FolderOpen className="h-4 w-4" />
              <span className={fontClass}>{getTranslation(category.translations, params.locale)}</span>
            </div>
          </TableCell>
          <TableCell>
            <code className={`text-sm ${fontClass}`}>{category.slug}</code>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className={fontClass}>
              {category.type}
            </Badge>
          </TableCell>
          <TableCell>
            <span className={`text-sm text-muted-foreground ${fontClass}`}>
              {category.parent ? getTranslation(category.parent.translations, params.locale) : '-'}
            </span>
          </TableCell>
          <TableCell>
            <span className={`text-sm ${fontClass}`}>
              {category._count?.contentItems || 0}
            </span>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                <DropdownMenuItem asChild>
                  <Link href={`/${params.locale}/admin/categories/${category.id}/edit`} className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(category.id)}
                  className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer text-destructive ${fontClass}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>,
        ...(category.children && category.children.length > 0 ? renderCategoryTree(category.children, level + 1) : [])
    ]).flat()
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${fontClass}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sahakum-navy mx-auto mb-4"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${fontClass}`}>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${params.locale}/admin`} className={fontClass}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Categories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
              Categories
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Organize your content with hierarchical categories
            </p>
          </div>
          <Button asChild className={fontClass}>
            <Link href={`/${params.locale}/admin/categories/create`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Link>
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className={`text-destructive ${fontClass}`}>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-8 ${fontClass}`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {categoryTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                    className={fontClass}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Categories ({filteredCategories.length})</CardTitle>
            <CardDescription className={fontClass}>
              Manage your content categories and their hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className={`mt-4 text-lg font-semibold ${fontClass}`}>No categories found</h3>
                <p className={`mt-2 text-muted-foreground ${fontClass}`}>
                  {searchTerm || selectedType !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first category'}
                </p>
                {(!searchTerm && selectedType === 'all') && (
                  <Button asChild className={`mt-4 ${fontClass}`}>
                    <Link href={`/${params.locale}/admin/categories/create`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={fontClass}>Name</TableHead>
                    <TableHead className={fontClass}>Slug</TableHead>
                    <TableHead className={fontClass}>Type</TableHead>
                    <TableHead className={fontClass}>Parent</TableHead>
                    <TableHead className={fontClass}>Content Count</TableHead>
                    <TableHead className={fontClass}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedType === 'all' ?
                    renderCategoryTree(categoryTree.filter(cat =>
                      searchTerm === '' ||
                      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      cat.translations.some((t: any) =>
                        t.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )) :
                    filteredCategories.map(category => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            <span className={fontClass}>{getTranslation(category.translations, params.locale)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className={`text-sm ${fontClass}`}>{category.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={fontClass}>
                            {category.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm text-muted-foreground ${fontClass}`}>
                            {category.parent ? getTranslation(category.parent.translations, params.locale) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${fontClass}`}>
                            {category._count?.contentItems || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                              <DropdownMenuItem asChild>
                                <Link href={`/${params.locale}/admin/categories/${category.id}/edit`} className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(category.id)}
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer text-destructive ${fontClass}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={fontClass}>Delete Category</AlertDialogTitle>
            <AlertDialogDescription className={fontClass}>
              Are you sure you want to delete this category? This action cannot be undone.
              All subcategories and content assignments will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={fontClass}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${fontClass}`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
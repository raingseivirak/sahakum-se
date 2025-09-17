'use client'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
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
  Newspaper,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Clock,
  User,
  Calendar,
  Tag,
  SearchX,
} from "lucide-react"
import Link from "next/link"
import { usePosts } from "@/hooks/use-posts"
import { useState, useEffect } from "react"

interface PostsPageProps {
  params: { locale: string }
}

export default function PostsPage({ params }: PostsPageProps) {
  const fontClass = 'font-sweden'
  const { posts, loading, error, deletePost } = usePosts()
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setDeletingPostId(postId)
      try {
        await deletePost(postId)
      } catch (err) {
        console.error('Failed to delete post:', err)
        alert('Failed to delete post')
      } finally {
        setDeletingPostId(null)
      }
    }
  }

  // Mock data - replaced with real data from API
  const mockPosts = [
    {
      id: 1,
      title: "Welcome to Sahakum Khmer Community",
      slug: "welcome-sahakum-khmer",
      status: "published",
      author: "Admin",
      publishedAt: "2024-01-20",
      updatedAt: "2024-01-20",
      category: "Community",
      tags: ["welcome", "community"],
      translations: ["sv", "en", "km"],
    },
    {
      id: 2,
      title: "Traditional Khmer New Year Celebration",
      slug: "khmer-new-year-2024",
      status: "published",
      author: "Cultural Team",
      publishedAt: "2024-01-18",
      updatedAt: "2024-01-19",
      category: "Culture",
      tags: ["culture", "festival", "tradition"],
      translations: ["sv", "en", "km"],
    },
    {
      id: 3,
      title: "Swedish Language Classes for Khmer Community",
      slug: "swedish-language-classes",
      status: "draft",
      author: "Education Team",
      publishedAt: null,
      updatedAt: "2024-01-16",
      category: "Education",
      tags: ["education", "language", "integration"],
      translations: ["sv", "en"],
    },
    {
      id: 4,
      title: "Community Kitchen Project Launch",
      slug: "community-kitchen-launch",
      status: "published",
      author: "Admin",
      publishedAt: "2024-01-14",
      updatedAt: "2024-01-15",
      category: "Projects",
      tags: ["food", "community", "project"],
      translations: ["sv", "en", "km"],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PUBLISHED":
        return <Badge variant="default" className="bg-green-500">Published</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "ARCHIVED":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLanguageBadges = (translations: any[]) => {
    const languageMap: { [key: string]: string } = {
      sv: "SV",
      en: "EN",
      km: "KM",
    }

    // If translations is an array of strings (mock data)
    if (typeof translations[0] === 'string') {
      return translations.map((lang) => (
        <Badge key={lang} variant="outline" className="text-xs">
          {languageMap[lang as string]}
        </Badge>
      ))
    }

    // If translations is an array of objects (real data)
    return translations.map((translation) => (
      <Badge key={translation.language} variant="outline" className="text-xs">
        {languageMap[translation.language]}
      </Badge>
    ))
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
                <BreadcrumbPage className={fontClass}>Posts</BreadcrumbPage>
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
              Posts
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage blog posts, news articles, and community updates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/posts/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>All Posts</CardTitle>
            <CardDescription className={fontClass}>
              A list of all blog posts and articles in your CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>Title</TableHead>
                  <TableHead className={fontClass}>Status</TableHead>
                  <TableHead className={fontClass}>Category</TableHead>
                  <TableHead className={fontClass}>Languages</TableHead>
                  <TableHead className={fontClass}>Author</TableHead>
                  <TableHead className={fontClass}>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading posts...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-600">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No posts found. <Link href={`/${params.locale}/admin/posts/create`} className="text-sahakum-gold hover:underline">Create your first post</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Newspaper className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className={`font-medium ${fontClass}`}>
                            {post.translations?.[0]?.title || 'Untitled'}
                          </div>
                          <div className={`text-sm text-muted-foreground ${fontClass}`}>/{post.slug}</div>
                          <div className="flex gap-1 mt-1">
                            {post.tags?.map((tag) => (
                              <Badge key={tag.tag?.id || tag} variant="outline" className="text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag.tag?.translations?.[0]?.name || tag}
                              </Badge>
                            )) ||
                            // Fallback for mock data
                            (typeof post.tags?.[0] === 'string' && post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            )))
                            }
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={fontClass}>
                        {post.categories?.[0]?.category?.translations?.[0]?.name || post.category || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {getLanguageBadges(post.translations)}
                      </div>
                    </TableCell>
                    <TableCell className={fontClass}>
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{post.author?.name || post.author}</span>
                      </div>
                    </TableCell>
                    <TableCell className={fontClass}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : "Not published"
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                          {post.status === 'PUBLISHED' && (
                            <DropdownMenuItem
                              className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                              onClick={() => window.open(`/${params.locale}/blog/${post.slug}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Post
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                            onClick={() => window.open(`/${params.locale}/blog/${post.slug}?preview=${post.id}`, '_blank')}
                          >
                            <SearchX className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                            onClick={() => window.location.href = `/${params.locale}/admin/posts/${post.id}/edit`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletingPostId === post.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
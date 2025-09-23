import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Globe,
  ChefHat,
  Newspaper,
  BookOpen,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { RecentActivity } from "@/components/admin/recent-activity"

interface AdminDashboardProps {
  params: { locale: string }
}

// English-only admin dashboard
const t = {
  title: 'Dashboard',
  welcome: 'Welcome to Sahakum Khmer CMS',
  overview: 'Overview',
  quickActions: 'Quick Actions',
  recentActivity: 'Recent Activity',
  pages: 'Pages',
  posts: 'Posts',
  events: 'Events',
  recipes: 'Recipes',
  news: 'News',
  users: 'Users',
  create: 'Create',
  view: 'View',
  edit: 'Edit',
  manage: 'Manage',
  total: 'Total',
  published: 'Published',
  draft: 'Draft',
  thisMonth: 'This Month',
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const fontClass = 'font-sweden'

  // Mock data - in real app, this would come from your database
  const stats = [
    {
      title: t.pages,
      count: 12,
      change: "+2",
      icon: FileText,
      color: "text-sweden-blue-primary",
      bgColor: "bg-sweden-blue-soft",
    },
    {
      title: t.posts,
      count: 24,
      change: "+5",
      icon: Newspaper,
      color: "text-sahakum-gold",
      bgColor: "bg-sahakum-gold-50",
    },
    {
      title: t.events,
      count: 8,
      change: "+1",
      icon: Calendar,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: t.recipes,
      count: 15,
      change: "+3",
      icon: ChefHat,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: t.news,
      count: 18,
      change: "+4",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: t.users,
      count: 156,
      change: "+12",
      icon: Users,
      color: "text-sahakum-navy",
      bgColor: "bg-sahakum-navy-50",
    },
  ]

  const quickActions = [
    {
      title: `${t.create} ${t.pages}`,
      description: 'Create a new page',
      href: `/${params.locale}/admin/pages/create`,
      icon: FileText,
    },
    {
      title: `${t.create} ${t.posts}`,
      description: 'Create a new post',
      href: `/${params.locale}/admin/posts/create`,
      icon: Newspaper,
    },
    {
      title: `${t.create} ${t.events}`,
      description: 'Create a new event',
      href: `/${params.locale}/admin/events/create`,
      icon: Calendar,
    },
    {
      title: `${t.create} ${t.recipes}`,
      description: 'Create a new recipe',
      href: `/${params.locale}/admin/recipes/create`,
      icon: ChefHat,
    },
  ]

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
                  {t.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
            {t.title}
          </h2>
          <div className="flex items-center space-x-2">
            <Button asChild className={fontClass}>
              <Link href={`/${params.locale}`}>
                <Globe className="mr-2 h-4 w-4" />
                {t.view} Site
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>
            {t.welcome}
          </p>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${fontClass}`}>
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className={`text-xs text-muted-foreground ${fontClass}`}>
                    {stat.change} {t.thisMonth}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>{t.quickActions}</CardTitle>
                <CardDescription className={fontClass}>
                  Quickly create new content
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className={`justify-start h-auto p-4 ${fontClass}`}
                    asChild
                  >
                    <Link href={action.href}>
                      <div className="flex items-center space-x-3">
                        <action.icon className="h-5 w-5" />
                        <div className="space-y-1 text-left">
                          <p className="font-medium">{action.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <RecentActivity locale={params.locale} />
          </div>
        </div>
      </div>
    </div>
  )
}
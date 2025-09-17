import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import Link from "next/link"
import { PagesList } from "./pages-list"

interface PagesPageProps {
  params: { locale: string }
}

export default function PagesPage({ params }: PagesPageProps) {
  const fontClass = 'font-sweden'

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
                <BreadcrumbPage className={fontClass}>Pages</BreadcrumbPage>
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
              Pages
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage your website pages and their content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/pages/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Page
              </Link>
            </Button>
          </div>
        </div>

        {/* Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>All Pages</CardTitle>
            <CardDescription className={fontClass}>
              A list of all pages in your CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PagesList locale={params.locale} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import Link from "next/link"
import { UsersList } from "./users-list"

interface UsersPageProps {
  params: { locale: string }
}

export default function UsersPage({ params }: UsersPageProps) {
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
                <BreadcrumbPage className={fontClass}>Users</BreadcrumbPage>
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
              System Users
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage administrators and editors who can access the CMS
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/users/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Link>
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>All Users</CardTitle>
            <CardDescription className={fontClass}>
              System administrators and editors with access to the CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersList locale={params.locale} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
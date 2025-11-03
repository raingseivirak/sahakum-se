import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { BoardMembersList } from './board-members-list'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale })
  return {
    title: `${t('boardMembers')} | Admin`,
  }
}

export default async function BoardMembersPage({
  params,
}: {
  params: { locale: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  const t = await getTranslations({ locale: params.locale })
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
                <BreadcrumbPage className={fontClass}>Board Members</BreadcrumbPage>
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
              Board Members
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage board members and their information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/board-members/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Board Member
              </Link>
            </Button>
          </div>
        </div>

        {/* Board Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>All Board Members</CardTitle>
            <CardDescription className={fontClass}>
              A list of all board members in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className={fontClass}>Loading board members...</div>}>
              <BoardMembersList locale={params.locale} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { BoardMemberForm } from '../../board-member-form'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
  const t = await getTranslations({ locale: params.locale })
  return {
    title: `Edit Board Member | Admin`,
  }
}

export default async function EditBoardMemberPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
    redirect(`/${params.locale}/auth/signin`)
  }

  const boardMember = await prisma.boardMember.findUnique({
    where: { id: params.id },
    include: {
      translations: true,
    },
  })

  if (!boardMember) {
    redirect(`/${params.locale}/admin/board-members`)
  }

  // Transform data for form
  const initialData = {
    slug: boardMember.slug,
    firstName: boardMember.firstName,
    lastName: boardMember.lastName,
    firstNameKhmer: boardMember.firstNameKhmer || '',
    lastNameKhmer: boardMember.lastNameKhmer || '',
    profileImage: boardMember.profileImage || '',
    email: boardMember.email || '',
    phone: boardMember.phone || '',
    order: boardMember.order,
    isChairman: boardMember.isChairman,
    active: boardMember.active,
    joinedBoard: boardMember.joinedBoard
      ? new Date(boardMember.joinedBoard).toISOString().split('T')[0]
      : '',
    translations: ['en', 'sv', 'km'].map((lang) => {
      const translation = boardMember.translations.find((t) => t.language === lang)
      return {
        language: lang,
        position: translation?.position || '',
        education: translation?.education || '',
        vision: translation?.vision || '',
        bio: translation?.bio || '',
      }
    }),
  }

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
                <BreadcrumbLink href={`/${params.locale}/admin/board-members`} className={fontClass}>
                  Board Members
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Edit</BreadcrumbPage>
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
              Edit Board Member
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Update board member information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/board-members`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Board Members
              </Link>
            </Button>
          </div>
        </div>

        {/* Form */}
        <BoardMemberForm
          initialData={initialData}
          isEdit={true}
          boardMemberId={params.id}
          locale={params.locale}
        />
      </div>
    </div>
  )
}

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { MemberEditForm } from "../../member-edit-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditMemberPageProps {
  params: {
    locale: string
    id: string
  }
}

async function getMember(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id }
    })
    return member
  } catch (error) {
    console.error("Failed to fetch member:", error)
    return null
  }
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const member = await getMember(params.id)
  const fontClass = 'font-sweden'

  if (!member) {
    notFound()
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
                <BreadcrumbLink href={`/${params.locale}/admin/members`} className={fontClass}>
                  Members
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Edit Member</BreadcrumbPage>
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
              Edit Member
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Update member information and contact details
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/members`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Members
              </Link>
            </Button>
          </div>
        </div>

        {/* Member Edit Form */}
        <MemberEditForm member={member} locale={params.locale} />
      </div>
    </div>
  )
}
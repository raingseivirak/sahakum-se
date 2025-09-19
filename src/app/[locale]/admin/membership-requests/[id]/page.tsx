import { MembershipRequestDetail } from "./membership-request-detail"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, Eye, CheckCircle, XCircle, FileText } from "lucide-react"
import Link from "next/link"

interface MembershipRequestDetailPageProps {
  params: { locale: string; id: string }
}

async function getMembershipRequest(id: string) {
  try {
    const request = await prisma.membershipRequest.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        createdMember: {
          select: {
            id: true,
            memberNumber: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        statusHistory: {
          include: {
            changedByUser: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { changedAt: 'desc' }
        }
      }
    })

    return request
  } catch (error) {
    console.error('Error fetching membership request:', error)
    return null
  }
}

export default async function MembershipRequestDetailPage({ params }: MembershipRequestDetailPageProps) {
  const request = await getMembershipRequest(params.id)
  const fontClass = 'font-sweden'

  if (!request) {
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
                <BreadcrumbLink href={`/${params.locale}/admin/membership-requests`} className={fontClass}>
                  Membership Requests
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>
                  {request.requestNumber}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center gap-4">
            <div>
              <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
                Request #{request.requestNumber}
              </h2>
              <p className={`text-muted-foreground ${fontClass}`}>
                Submitted by {request.firstName} {request.lastName} on {new Date(request.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                switch (request.status) {
                  case 'PENDING':
                    return (
                      <>
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 ${fontClass}`}>
                          Pending Review
                        </span>
                      </>
                    )
                  case 'UNDER_REVIEW':
                    return (
                      <>
                        <Eye className="h-5 w-5 text-blue-600" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ${fontClass}`}>
                          Under Review
                        </span>
                      </>
                    )
                  case 'APPROVED':
                    return (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ${fontClass}`}>
                          Approved
                        </span>
                      </>
                    )
                  case 'REJECTED':
                    return (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 ${fontClass}`}>
                          Rejected
                        </span>
                      </>
                    )
                  default:
                    return (
                      <>
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 ${fontClass}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </>
                    )
                }
              })()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/membership-requests`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Requests
              </Link>
            </Button>
          </div>
        </div>

        {/* Request Detail Component */}
        <MembershipRequestDetail request={request} locale={params.locale} />
      </div>
    </div>
  )
}
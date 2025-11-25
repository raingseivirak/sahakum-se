"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  FileText,
  UserPlus,
  AlertCircle,
  Users,
} from "lucide-react"
import Link from "next/link"

interface BoardVote {
  id: string
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN'
  boardMember: {
    id: string
    name: string
    email: string
  }
  votedAt: string
  notes?: string
}

interface MembershipRequest {
  id: string
  requestNumber: string
  firstName: string
  lastName: string
  firstNameKhmer?: string
  lastNameKhmer?: string
  email: string
  phone?: string
  address: string
  city: string
  postalCode: string
  country: string
  residenceStatus: string
  residenceSince?: string
  motivation?: string
  hearAboutUs?: string
  interests?: string
  skills?: string
  requestedMemberType: string
  status: string
  submittedAt: string
  updatedAt: string
  reviewedBy?: string
  reviewedAt?: string
  adminNotes?: string
  rejectionReason?: string
  approvedBy?: string
  approvedAt?: string
  createdMemberId?: string
  reviewer?: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
    email: string
  }
  createdMember?: {
    id: string
    memberNumber: string
    firstName: string
    lastName: string
  }
  boardVotes?: BoardVote[]
}

interface MembershipRequestsListProps {
  locale: string
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  ADDITIONAL_INFO_REQUESTED: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
}

const residenceStatusLabels = {
  STUDENT: "Student",
  WORK_PERMIT: "Work Permit",
  PERMANENT_RESIDENT: "Permanent Resident",
  CITIZEN: "Swedish Citizen",
  EU_CITIZEN: "EU Citizen",
  OTHER: "Other",
}

export function MembershipRequestsList({ locale }: MembershipRequestsListProps) {
  const fontClass = 'font-sweden'
  const {data: session} = useSession()
  const [requests, setRequests] = useState<MembershipRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [totalCount, setTotalCount] = useState(0)
  const [totalBoardMembers, setTotalBoardMembers] = useState(0)

  // Pagination state
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const limit = 20 // Show 20 requests per page

  // Helper function: Check if current user voted on request
  const hasCurrentUserVoted = (request: MembershipRequest): boolean => {
    if (!session?.user?.id || !request.boardVotes) return false
    return request.boardVotes.some(vote => vote.boardMember.id === session.user.id)
  }

  // Helper function: Get vote count for request
  const getVoteCount = (request: MembershipRequest): string => {
    const voteCount = request.boardVotes?.length || 0
    return `${voteCount}/${totalBoardMembers}`
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const response = await fetch(`/api/membership-requests?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch requests')

      const data = await response.json()
      setRequests(data.requests)
      setTotalCount(data.pagination.total)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBoardMembersCount = async () => {
    try {
      const response = await fetch('/api/users?role=BOARD')
      if (response.ok) {
        const data = await response.json()
        setTotalBoardMembers(data.users?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching board members count:', error)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchBoardMembersCount()
  }, [statusFilter, page])

  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase()
    return (
      request.firstName.toLowerCase().includes(searchLower) ||
      request.lastName.toLowerCase().includes(searchLower) ||
      request.email.toLowerCase().includes(searchLower) ||
      request.requestNumber.toLowerCase().includes(searchLower) ||
      (request.firstNameKhmer && request.firstNameKhmer.includes(searchTerm)) ||
      (request.lastNameKhmer && request.lastNameKhmer.includes(searchTerm))
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} border-0 ${fontClass}`}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'UNDER_REVIEW':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-sahakum-gold" />
            <span className={`ml-2 ${fontClass}`}>Loading requests...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-gray-600 ${fontClass}`}>Total Requests</p>
                <p className={`text-2xl font-bold text-sahakum-navy ${fontClass}`}>{totalCount}</p>
              </div>
              <FileText className="h-8 w-8 text-sahakum-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-gray-600 ${fontClass}`}>Pending</p>
                <p className={`text-2xl font-bold text-yellow-600 ${fontClass}`}>
                  {requests.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-gray-600 ${fontClass}`}>Under Review</p>
                <p className={`text-2xl font-bold text-blue-600 ${fontClass}`}>
                  {requests.filter(r => r.status === 'UNDER_REVIEW').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm text-gray-600 ${fontClass}`}>Approved</p>
                <p className={`text-2xl font-bold text-green-600 ${fontClass}`}>
                  {requests.filter(r => r.status === 'APPROVED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className={fontClass}>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or request number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${fontClass}`}
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setPage(1) // Reset to first page when filter changes
            }}>
              <SelectTrigger className={`w-full md:w-48 ${fontClass}`}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="all" className="hover:bg-gray-50">All Statuses</SelectItem>
                <SelectItem value="PENDING" className="hover:bg-gray-50">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW" className="hover:bg-gray-50">Under Review</SelectItem>
                <SelectItem value="ADDITIONAL_INFO_REQUESTED" className="hover:bg-gray-50">Additional Info Requested</SelectItem>
                <SelectItem value="APPROVED" className="hover:bg-gray-50">Approved</SelectItem>
                <SelectItem value="REJECTED" className="hover:bg-gray-50">Rejected</SelectItem>
                <SelectItem value="WITHDRAWN" className="hover:bg-gray-50">Withdrawn</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchRequests}
              variant="outline"
              className={fontClass}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className={fontClass}>Membership Requests</CardTitle>
          <CardDescription className={fontClass}>
            {filteredRequests.length} of {requests.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>Request #</TableHead>
                  <TableHead className={fontClass}>Applicant</TableHead>
                  <TableHead className={fontClass}>Contact</TableHead>
                  <TableHead className={fontClass}>Residence</TableHead>
                  <TableHead className={fontClass}>Votes</TableHead>
                  <TableHead className={fontClass}>Status</TableHead>
                  <TableHead className={fontClass}>Submitted</TableHead>
                  <TableHead className={fontClass}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className={fontClass}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="font-mono text-sm">{request.requestNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={fontClass}>
                        <p className="font-medium text-sahakum-navy">
                          {request.firstName} {request.lastName}
                        </p>
                        {(request.firstNameKhmer || request.lastNameKhmer) && (
                          <p className="text-sm text-gray-600">
                            {request.firstNameKhmer} {request.lastNameKhmer}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">{request.requestedMemberType}</p>
                      </div>
                    </TableCell>
                    <TableCell className={fontClass}>
                      <div>
                        <p className="text-sm">{request.email}</p>
                        {request.phone && (
                          <p className="text-sm text-gray-600">{request.phone}</p>
                        )}
                        <p className="text-sm text-gray-600">{request.city}</p>
                      </div>
                    </TableCell>
                    <TableCell className={fontClass}>
                      <Badge variant="outline" className="text-xs">
                        {residenceStatusLabels[request.residenceStatus as keyof typeof residenceStatusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className={fontClass}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">{getVoteCount(request)}</span>
                        </div>
                        {request.status === 'PENDING' && !hasCurrentUserVoted(request) && (
                          <Badge className="bg-orange-100 text-orange-800 border-0 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className={`text-sm ${fontClass}`}>
                      {formatDate(request.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.status === 'PENDING' ? (
                          <Button asChild variant="default" size="sm" className={fontClass}>
                            <Link href={`/${locale}/admin/membership-requests/${request.id}`}>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" size="sm" className={fontClass}>
                            <Link href={`/${locale}/admin/membership-requests/${request.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className={`text-gray-500 ${fontClass}`}>
                  {searchTerm || (statusFilter && statusFilter !== 'all') ? 'No matching requests found.' : 'No membership requests yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm text-gray-600 ${fontClass}`}>
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} requests
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPage(page - 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={page === 1}
              className={fontClass}
            >
              Previous
            </Button>
            <div className={`flex items-center gap-2 px-4 ${fontClass}`}>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setPage(page + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={page === totalPages}
              className={fontClass}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
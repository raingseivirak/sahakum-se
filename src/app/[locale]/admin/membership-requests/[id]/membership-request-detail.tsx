"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserPlus,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface MembershipRequest {
  id: string
  requestNumber: string
  firstName: string
  lastName: string
  firstNameKhmer?: string | null
  lastNameKhmer?: string | null
  dateOfBirth?: Date | null
  email: string
  phone?: string | null
  address: string
  city: string
  postalCode: string
  country: string
  residenceStatus: string
  residenceSince?: Date | null
  motivation?: string | null
  hearAboutUs?: string | null
  interests?: string | null
  skills?: string | null
  requestedMemberType: string
  status: string
  submittedAt: Date
  updatedAt: Date
  reviewedBy?: string | null
  reviewedAt?: Date | null
  reviewNotes?: string | null
  adminNotes?: string | null
  rejectionReason?: string | null
  approvedBy?: string | null
  approvedAt?: Date | null
  createdMemberId?: string | null
  reviewer?: {
    id: string
    name: string
    email: string
  } | null
  approver?: {
    id: string
    name: string
    email: string
  } | null
  createdMember?: {
    id: string
    memberNumber: string
    firstName: string
    lastName: string
    email: string
  } | null
  statusHistory?: {
    id: string
    fromStatus: string | null
    toStatus: string
    changedAt: Date | string
    notes?: string | null
    changedByUser?: {
      id: string
      name: string
      email: string
    } | null
  }[]
}

interface MembershipRequestDetailProps {
  request: MembershipRequest
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

export function MembershipRequestDetail({ request, locale }: MembershipRequestDetailProps) {
  const fontClass = 'font-sweden'

  // Debug: Log status history data
  console.log('Status history data:', request.statusHistory)
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState(request.status)
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "")
  const [rejectionReason, setRejectionReason] = useState(request.rejectionReason || "")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      year: 'numeric',
      month: 'long',
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
      case 'ADDITIONAL_INFO_REQUESTED':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    setError("")
    setSuccess("")

    try {
      const updateData: any = {
        status: newStatus,
        adminNotes: adminNotes.trim() || null,
      }


      if (newStatus === 'REJECTED' && rejectionReason.trim()) {
        updateData.rejectionReason = rejectionReason.trim()
      }

      const response = await fetch(`/api/membership-requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update request')
      }

      setSuccess("Request updated successfully!")
      setTimeout(() => router.refresh(), 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApproval = async () => {
    setIsUpdating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/membership-requests/${request.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve request')
      }

      const result = await response.json()
      setSuccess(`Request approved! Member created with ID: ${result.memberId}`)
      setTimeout(() => router.refresh(), 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Full Name
                  </label>
                  <p className={`text-lg font-semibold text-sahakum-navy ${fontClass}`}>
                    {request.firstName} {request.lastName}
                  </p>
                </div>

                {(request.firstNameKhmer || request.lastNameKhmer) && (
                  <div>
                    <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                      Khmer Name
                    </label>
                    <p className={`text-lg ${fontClass}`}>
                      {request.firstNameKhmer} {request.lastNameKhmer}
                    </p>
                  </div>
                )}
              </div>

              {request.dateOfBirth && (
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Date of Birth
                  </label>
                  <p className={fontClass}>{formatDate(request.dateOfBirth)}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                      Email
                    </label>
                    <p className={fontClass}>{request.email}</p>
                  </div>
                </div>

                {request.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                        Phone
                      </label>
                      <p className={fontClass}>{request.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                <MapPin className="h-5 w-5" />
                Address in Sweden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                  Street Address
                </label>
                <p className={fontClass}>{request.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    City
                  </label>
                  <p className={fontClass}>{request.city}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Postal Code
                  </label>
                  <p className={fontClass}>{request.postalCode}</p>
                </div>
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Country
                  </label>
                  <p className={fontClass}>{request.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Residence Status
                  </label>
                  <Badge variant="outline" className={fontClass}>
                    {residenceStatusLabels[request.residenceStatus as keyof typeof residenceStatusLabels]}
                  </Badge>
                </div>

                {request.residenceSince && (
                  <div>
                    <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                      Living in Sweden Since
                    </label>
                    <p className={fontClass}>{formatDate(request.residenceSince)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                <FileText className="h-5 w-5" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                  Requested Membership Type
                </label>
                <Badge variant="outline" className={fontClass}>
                  {request.requestedMemberType}
                </Badge>
              </div>

              {request.motivation && (
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Motivation
                  </label>
                  <p className={`text-gray-700 bg-gray-50 p-3 rounded-md ${fontClass}`}>
                    {request.motivation}
                  </p>
                </div>
              )}

              {request.hearAboutUs && (
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    How they heard about us
                  </label>
                  <p className={fontClass}>{request.hearAboutUs}</p>
                </div>
              )}

              {request.interests && (
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Areas of Interest
                  </label>
                  <p className={`text-gray-700 bg-gray-50 p-3 rounded-md ${fontClass}`}>
                    {request.interests}
                  </p>
                </div>
              )}

              {request.skills && (
                <div>
                  <label className={`text-sm font-medium text-gray-700 ${fontClass}`}>
                    Skills & Talents
                  </label>
                  <p className={`text-gray-700 bg-gray-50 p-3 rounded-md ${fontClass}`}>
                    {request.skills}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className={fontClass}>Review & Actions</CardTitle>
              <CardDescription className={fontClass}>
                Update request status and add review notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${fontClass}`}>Status</label>
                {request.status === 'APPROVED' ? (
                  <div className="p-3 border rounded-md bg-green-50 border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className={`text-green-800 font-medium ${fontClass}`}>
                        Approved (via approval process)
                      </span>
                    </div>
                  </div>
                ) : (
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className={fontClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`bg-white border border-gray-200 shadow-lg ${fontClass}`}>
                      <SelectItem value="PENDING" className={`hover:bg-gray-50 ${fontClass}`}>Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW" className={`hover:bg-gray-50 ${fontClass}`}>Under Review</SelectItem>
                      <SelectItem value="ADDITIONAL_INFO_REQUESTED" className={`hover:bg-gray-50 ${fontClass}`}>Additional Info Requested</SelectItem>
                      <SelectItem value="APPROVED" className={`hover:bg-gray-50 ${fontClass}`}>Approved</SelectItem>
                      <SelectItem value="REJECTED" className={`hover:bg-gray-50 ${fontClass}`}>Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <label className={`text-sm font-medium ${fontClass}`}>Admin Notes</label>
                <Textarea
                  placeholder="Add internal notes about this request..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={fontClass}
                  rows={3}
                  disabled={request.status === 'APPROVED'}
                />
              </div>

              {newStatus === 'REJECTED' && (
                <div>
                  <label className={`text-sm font-medium ${fontClass}`}>Rejection Reason</label>
                  <Textarea
                    placeholder="Explain why this request was rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className={fontClass}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                {request.status !== 'APPROVED' && (
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    variant="outline"
                    className={`border-2 border-sahakum-navy text-sahakum-navy bg-white hover:bg-sahakum-navy hover:text-sahakum-gold ${fontClass}`}
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </Button>
                )}

                {(request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" className={`bg-green-600 hover:bg-green-700 ${fontClass}`}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Approve & Create Member
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className={fontClass}>Approve Membership Request</AlertDialogTitle>
                        <AlertDialogDescription className={fontClass}>
                          This will approve the request and automatically create a new member record.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={fontClass}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleApproval}
                          disabled={isUpdating}
                          className={`bg-green-600 hover:bg-green-700 ${fontClass}`}
                        >
                          {isUpdating ? 'Approving...' : 'Approve & Create Member'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Request Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className={fontClass}>Request Timeline</CardTitle>
              <CardDescription className={fontClass}>
                Recent activity (most recent first)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {/* Status History (most recent first) */}
                {request.statusHistory && request.statusHistory.length > 0 && (
                  request.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        history.toStatus === 'UNDER_REVIEW' ? 'bg-blue-100' :
                        history.toStatus === 'ADDITIONAL_INFO_REQUESTED' ? 'bg-orange-100' :
                        history.toStatus === 'APPROVED' ? 'bg-green-100' :
                        history.toStatus === 'REJECTED' ? 'bg-red-100' :
                        history.toStatus === 'PENDING' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      }`}>
                        {getStatusIcon(history.toStatus)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${fontClass}`}>
                            {history.fromStatus ? `${history.fromStatus.replace('_', ' ')} → ` : ''}
                            {history.toStatus.replace('_', ' ')}
                          </p>
                          {index === 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs text-gray-600 ${fontClass}`}>
                            {formatDate(history.changedAt)}
                          </p>
                          {history.changedByUser && (
                            <>
                              <span className="text-gray-400">•</span>
                              <p className={`text-xs text-gray-500 ${fontClass}`}>
                                {history.changedByUser.name}
                              </p>
                            </>
                          )}
                        </div>
                        {history.notes && (
                          <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                            <p className={`text-gray-700 ${fontClass}`}>
                              {history.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Request Submitted (shown at bottom since it's oldest) */}
                <div className="flex items-start gap-2 py-2 border-b border-gray-100">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${fontClass}`}>Request Submitted</p>
                    <p className={`text-xs text-gray-600 ${fontClass}`}>
                      {formatDate(request.submittedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {request.createdMember && (
                <div className="border-t pt-4">
                  <p className={`font-medium text-green-700 ${fontClass}`}>
                    Member Created
                  </p>
                  <p className={`text-sm text-gray-600 ${fontClass}`}>
                    Member #{request.createdMember.memberNumber}
                  </p>
                  <Button asChild variant="outline" size="sm" className={`mt-2 ${fontClass}`}>
                    <Link href={`/${locale}/admin/members/${request.createdMember.id}/edit`}>
                      View Member Profile
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
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
  MailCheck,
  RefreshCw,
  Users,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Trash2,
} from "lucide-react"
import Link from "next/link"

interface BoardMemberVote {
  id: string
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN'
  votedAt: Date | string
  notes?: string | null
  boardMember: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface VoteStatus {
  approvalSystem: 'SINGLE' | 'MULTI_BOARD'
  status: string
  votes: BoardMemberVote[]
  voteCounts: {
    approvals: number
    rejections: number
    abstentions: number
    total: number
    totalBoardMembers: number
    threshold: string
  }
  currentUserVote: BoardMemberVote | null
  hasVoted: boolean
  pendingVoters: {
    id: string
    name: string
    email: string
    role: string
  }[]
  allBoardMembers: {
    id: string
    name: string
    email: string
    role: string
  }[]
}

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
  approvalSystem?: 'SINGLE' | 'MULTI_BOARD'
  preferredLanguage?: string | null
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
  userRole?: string | null
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

export function MembershipRequestDetail({ request, locale, userRole }: MembershipRequestDetailProps) {
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
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState("")
  const [emailError, setEmailError] = useState("")

  // Board voting state
  const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null)
  const [isLoadingVotes, setIsLoadingVotes] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [voteNotes, setVoteNotes] = useState("")
  const [voteError, setVoteError] = useState("")
  const [voteSuccess, setVoteSuccess] = useState("")

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Create account state
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [accountSuccess, setAccountSuccess] = useState("")
  const [accountError, setAccountError] = useState("")

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

  const getTimelineIcon = (notes: string | null, fromStatus: string | null, toStatus: string) => {
    // Check if this is a vote event
    if (notes?.includes('Board vote:')) {
      if (notes.includes('APPROVE')) {
        return <ThumbsUp className="h-3 w-3 text-green-600" />
      } else if (notes.includes('REJECT')) {
        return <ThumbsDown className="h-3 w-3 text-red-600" />
      } else if (notes.includes('ABSTAIN')) {
        return <MinusCircle className="h-3 w-3 text-gray-600" />
      }
    }

    // Check if this is an email event
    if (notes?.includes('email sent') || notes?.includes('email resent')) {
      return <MailCheck className="h-3 w-3 text-blue-600" />
    }

    // Otherwise use status-based icon
    return getStatusIcon(toStatus)
  }

  const getTimelineBgColor = (notes: string | null, toStatus: string) => {
    // Check if this is a vote event
    if (notes?.includes('Board vote:')) {
      if (notes.includes('APPROVE')) return 'bg-green-100'
      if (notes.includes('REJECT')) return 'bg-red-100'
      if (notes.includes('ABSTAIN')) return 'bg-gray-100'
    }

    // Check if this is an email event
    if (notes?.includes('email sent') || notes?.includes('email resent')) {
      return 'bg-blue-100'
    }

    // Otherwise use status-based color
    switch (toStatus) {
      case 'UNDER_REVIEW': return 'bg-blue-100'
      case 'ADDITIONAL_INFO_REQUESTED': return 'bg-orange-100'
      case 'APPROVED': return 'bg-green-100'
      case 'REJECTED': return 'bg-red-100'
      case 'PENDING': return 'bg-yellow-100'
      default: return 'bg-gray-100'
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

  const handleResendEmail = async (emailType: 'welcome' | 'approval') => {
    setIsResendingEmail(true)
    setEmailError("")
    setEmailSuccess("")

    try {
      const response = await fetch(`/api/membership-requests/${request.id}/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to resend email')
      }

      const result = await response.json()
      setEmailSuccess(`${emailType === 'welcome' ? 'Welcome' : 'Approval'} email sent successfully to ${result.sentTo}`)

      // Clear success message after 5 seconds
      setTimeout(() => setEmailSuccess(""), 5000)

    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'An error occurred while sending email')

      // Clear error message after 8 seconds
      setTimeout(() => setEmailError(""), 8000)
    } finally {
      setIsResendingEmail(false)
    }
  }

  // Fetch vote status for multi-board approval
  const fetchVoteStatus = async () => {
    if (request.approvalSystem !== 'MULTI_BOARD') return

    setIsLoadingVotes(true)
    try {
      const response = await fetch(`/api/membership-requests/${request.id}/vote`)
      if (response.ok) {
        const data = await response.json()
        setVoteStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch vote status:', err)
    } finally {
      setIsLoadingVotes(false)
    }
  }

  // Cast vote
  const handleVote = async (vote: 'APPROVE' | 'REJECT' | 'ABSTAIN') => {
    setIsVoting(true)
    setVoteError("")
    setVoteSuccess("")

    try {
      const response = await fetch(`/api/membership-requests/${request.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vote,
          notes: voteNotes.trim() || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cast vote')
      }

      const result = await response.json()
      setVoteSuccess(`Vote cast successfully! ${result.thresholdMet ? 'Approval threshold has been met.' : ''}`)
      setVoteNotes("")

      // Refresh vote status and page
      await fetchVoteStatus()
      setTimeout(() => router.refresh(), 1000)

    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsVoting(false)
    }
  }

  // Fetch vote status on mount if using multi-board approval
  useEffect(() => {
    fetchVoteStatus()
  }, [request.id, request.approvalSystem])

  // Delete membership request (admin only)
  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch(`/api/membership-requests/${request.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete membership request')
      }

      // Redirect to membership requests list
      router.push(`/${locale}/admin/membership-requests`)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'An error occurred while deleting the request')
      setIsDeleting(false)
    }
  }

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true)
    setAccountError("")
    setAccountSuccess("")

    try {
      const response = await fetch(`/api/membership-requests/${request.id}/create-account`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user account')
      }

      setAccountSuccess(`User account created successfully! Login credentials sent to ${data.user.email}`)

      // Refresh the page to show updated status
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'An error occurred while creating user account')
    } finally {
      setIsCreatingAccount(false)
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

      {emailError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{emailError}</AlertDescription>
        </Alert>
      )}

      {emailSuccess && (
        <Alert className="border-blue-200 bg-blue-50">
          <MailCheck className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">{emailSuccess}</AlertDescription>
        </Alert>
      )}

      {voteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{voteError}</AlertDescription>
        </Alert>
      )}

      {voteSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{voteSuccess}</AlertDescription>
        </Alert>
      )}

      {accountError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{accountError}</AlertDescription>
        </Alert>
      )}

      {accountSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <UserPlus className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{accountSuccess}</AlertDescription>
        </Alert>
      )}

      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
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
          {/* Board Voting Card - Only for MULTI_BOARD approval */}
          {request.approvalSystem === 'MULTI_BOARD' && voteStatus && (
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                  <Users className="h-5 w-5" />
                  Board Voting
                </CardTitle>
                <CardDescription className={fontClass}>
                  {voteStatus.voteCounts.threshold} approval required
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vote Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={fontClass}>Progress</span>
                    <span className={`font-semibold ${fontClass}`}>
                      {voteStatus.voteCounts.total} / {voteStatus.voteCounts.totalBoardMembers} votes cast
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(voteStatus.voteCounts.total / voteStatus.voteCounts.totalBoardMembers) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Vote Counts */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded-md border border-green-200">
                    <div className="flex items-center justify-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      <span className={`text-2xl font-bold text-green-600 ${fontClass}`}>
                        {voteStatus.voteCounts.approvals}
                      </span>
                    </div>
                    <p className={`text-xs text-green-700 ${fontClass}`}>Approve</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center justify-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className={`text-2xl font-bold text-red-600 ${fontClass}`}>
                        {voteStatus.voteCounts.rejections}
                      </span>
                    </div>
                    <p className={`text-xs text-red-700 ${fontClass}`}>Reject</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex items-center justify-center gap-1">
                      <MinusCircle className="h-4 w-4 text-gray-600" />
                      <span className={`text-2xl font-bold text-gray-600 ${fontClass}`}>
                        {voteStatus.voteCounts.abstentions}
                      </span>
                    </div>
                    <p className={`text-xs text-gray-700 ${fontClass}`}>Abstain</p>
                  </div>
                </div>

                {/* Current User Voting Interface */}
                {!voteStatus.hasVoted && (request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                  <div className="space-y-3 pt-2 border-t">
                    <p className={`font-medium text-sm ${fontClass}`}>Cast Your Vote</p>
                    <Textarea
                      placeholder="Optional notes about your vote..."
                      value={voteNotes}
                      onChange={(e) => setVoteNotes(e.target.value)}
                      className={fontClass}
                      rows={2}
                      disabled={isVoting}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleVote('APPROVE')}
                        disabled={isVoting}
                        className={`bg-green-600 hover:bg-green-700 ${fontClass}`}
                        size="sm"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleVote('REJECT')}
                        disabled={isVoting}
                        variant="destructive"
                        className={fontClass}
                        size="sm"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleVote('ABSTAIN')}
                        disabled={isVoting}
                        variant="outline"
                        className={fontClass}
                        size="sm"
                      >
                        <MinusCircle className="h-3 w-3 mr-1" />
                        Abstain
                      </Button>
                    </div>
                  </div>
                )}

                {/* Current User Already Voted */}
                {voteStatus.hasVoted && voteStatus.currentUserVote && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className={`text-sm font-medium text-blue-800 ${fontClass}`}>
                      You voted: {voteStatus.currentUserVote.vote}
                    </p>
                    {voteStatus.currentUserVote.notes && (
                      <p className={`text-xs text-blue-700 mt-1 ${fontClass}`}>
                        {voteStatus.currentUserVote.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Votes Cast */}
                {voteStatus.votes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className={`font-medium text-sm ${fontClass}`}>
                      Votes Cast ({voteStatus.votes.length})
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {voteStatus.votes.map((vote) => (
                        <div key={vote.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            {vote.vote === 'APPROVE' && <ThumbsUp className="h-3 w-3 text-green-600" />}
                            {vote.vote === 'REJECT' && <ThumbsDown className="h-3 w-3 text-red-600" />}
                            {vote.vote === 'ABSTAIN' && <MinusCircle className="h-3 w-3 text-gray-600" />}
                            <span className={fontClass}>{vote.boardMember.name}</span>
                          </div>
                          <Badge
                            variant={vote.vote === 'APPROVE' ? 'default' : vote.vote === 'REJECT' ? 'destructive' : 'outline'}
                            className={fontClass}
                          >
                            {vote.vote}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Voters */}
                {voteStatus.pendingVoters.length > 0 && (request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className={`font-medium text-sm ${fontClass}`}>
                      Pending Votes ({voteStatus.pendingVoters.length})
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {voteStatus.pendingVoters.map((voter) => (
                        <div key={voter.id} className="flex items-center gap-2 text-sm p-2 bg-yellow-50 rounded">
                          <Clock className="h-3 w-3 text-yellow-600" />
                          <span className={fontClass}>{voter.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review & Actions - Visible to BOARD and ADMIN */}
          {(userRole === 'ADMIN' || userRole === 'BOARD') && (
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Review & Actions</CardTitle>
                <CardDescription className={fontClass}>
                  {userRole === 'ADMIN' && request.approvalSystem === 'MULTI_BOARD'
                    ? 'Admin controls for exceptional cases (normal approval via board voting above)'
                    : 'Update request status and add review notes'
                  }
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
                        {/* Only show APPROVED/REJECTED options to ADMIN */}
                        {userRole === 'ADMIN' && (
                          <>
                            <SelectItem value="APPROVED" className={`hover:bg-gray-50 ${fontClass}`}>Approved</SelectItem>
                            <SelectItem value="REJECTED" className={`hover:bg-gray-50 ${fontClass}`}>Rejected</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <label className={`text-sm font-medium ${fontClass}`}>
                    {userRole === 'ADMIN' ? 'Admin Notes' : 'Review Notes'}
                  </label>
                  <Textarea
                    placeholder={userRole === 'ADMIN'
                      ? "Add internal notes about this request..."
                      : "Add your review notes or comments..."}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className={fontClass}
                    rows={3}
                    disabled={request.status === 'APPROVED'}
                  />
                </div>

                {/* Rejection reason - ADMIN only */}
                {userRole === 'ADMIN' && newStatus === 'REJECTED' && (
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
                  {/* Update Status button - available to both BOARD and ADMIN */}
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

                  {/* Approve & Create Member - ADMIN only, and only for exceptional override */}
                  {userRole === 'ADMIN' &&
                   (request.status === 'PENDING' || request.status === 'UNDER_REVIEW') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" className={`bg-green-600 hover:bg-green-700 ${fontClass}`}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          {request.approvalSystem === 'MULTI_BOARD'
                            ? 'Override & Approve'
                            : 'Approve & Create Member'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className={fontClass}>
                            {request.approvalSystem === 'MULTI_BOARD'
                              ? 'Admin Override - Approve Membership'
                              : 'Approve Membership Request'}
                          </AlertDialogTitle>
                          <AlertDialogDescription className={fontClass}>
                            {request.approvalSystem === 'MULTI_BOARD' ? (
                              <>
                                You are about to <strong>override the board voting process</strong> and approve this membership request directly.
                                <br /><br />
                                This action should only be used in exceptional cases and will be logged for audit purposes.
                              </>
                            ) : (
                              <>
                                This will approve the request and automatically create a new member record.
                                This action cannot be undone.
                              </>
                            )}
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

                  {/* Create User Account Button - ADMIN only, when member exists but user account doesn't */}
                  {userRole === 'ADMIN' && request.status === 'APPROVED' && request.createdMemberId && !request.createdMember?.user && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className={`border-2 border-[var(--sahakum-gold)] text-[var(--sahakum-navy)] bg-white hover:bg-[var(--sahakum-gold)] hover:text-white ${fontClass}`}
                          disabled={isCreatingAccount}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {isCreatingAccount ? 'Creating Account...' : 'Create User Account'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className={`text-[var(--sahakum-navy)] ${fontClass}`}>
                            Create User Account
                          </AlertDialogTitle>
                          <AlertDialogDescription className={fontClass}>
                            This will create a user account for member #{request.createdMember?.memberNumber} and send login credentials to {request.createdMember?.email}.
                            <br /><br />
                            A temporary password will be generated and emailed to the member.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className={fontClass} disabled={isCreatingAccount}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCreateAccount}
                            disabled={isCreatingAccount}
                            className={`bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] ${fontClass}`}
                          >
                            {isCreatingAccount ? 'Creating...' : 'Yes, Create Account'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Delete Button - ADMIN only */}
                  {userRole === 'ADMIN' && !request.createdMemberId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className={`border-2 border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white ${fontClass}`}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? 'Deleting...' : 'Delete Request'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className={`text-red-600 ${fontClass}`}>
                            Delete Membership Request
                          </AlertDialogTitle>
                          <AlertDialogDescription className={fontClass}>
                            Are you sure you want to delete this membership request? This will permanently remove:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Request #{request.requestNumber}</li>
                              <li>All board member votes</li>
                              <li>Status history</li>
                              <li>All associated data</li>
                            </ul>
                            <br />
                            <strong className="text-red-600">This action cannot be undone.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className={fontClass} disabled={isDeleting}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                          >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Request'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Management */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                <MailCheck className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription className={fontClass}>
                Resend email notifications to the applicant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                <p className={fontClass}>
                  <strong>Applicant Email:</strong> {request.email}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleResendEmail('welcome')}
                  disabled={isResendingEmail}
                  variant="outline"
                  className={`border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white ${fontClass}`}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isResendingEmail ? 'animate-spin' : ''}`} />
                  {isResendingEmail ? 'Sending...' : 'Resend Welcome Email'}
                </Button>

                {request.status === 'APPROVED' && (
                  <Button
                    onClick={() => handleResendEmail('approval')}
                    disabled={isResendingEmail}
                    variant="outline"
                    className={`border-2 border-green-600 text-green-600 bg-white hover:bg-green-600 hover:text-white ${fontClass}`}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isResendingEmail ? 'animate-spin' : ''}`} />
                    {isResendingEmail ? 'Sending...' : 'Resend Approval Email'}
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-3 space-y-1">
                <p className={fontClass}>
                  • <strong>Welcome Email:</strong> Confirmation sent when application is submitted
                </p>
                {request.status === 'APPROVED' && (
                  <p className={fontClass}>
                    • <strong>Approval Email:</strong> Congratulations email with member number
                  </p>
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
                  request.statusHistory.map((history, index) => {
                    const isVoteEvent = history.notes?.includes('Board vote:')
                    const isEmailEvent = history.notes?.includes('email sent') || history.notes?.includes('email resent')
                    const isStatusChange = history.fromStatus !== null && history.fromStatus !== history.toStatus

                    return (
                      <div key={history.id} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getTimelineBgColor(history.notes, history.toStatus)}`}>
                          {getTimelineIcon(history.notes, history.fromStatus, history.toStatus)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${fontClass}`}>
                              {isVoteEvent ? (
                                // Vote event title
                                history.notes?.split(' - ')[0]
                              ) : isEmailEvent ? (
                                // Email event title
                                history.notes?.split(' to ')[0]
                              ) : (
                                // Status change title
                                <>
                                  {history.fromStatus ? `${history.fromStatus.replace('_', ' ')} → ` : ''}
                                  {history.toStatus.replace('_', ' ')}
                                </>
                              )}
                            </p>
                            {index === 0 && !isVoteEvent && !isEmailEvent && (
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
                          {history.notes && (isVoteEvent || isEmailEvent) && (
                            <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                              <p className={`text-gray-700 ${fontClass}`}>
                                {isVoteEvent && history.notes.includes(' - ')
                                  ? history.notes.split(' - ').slice(1).join(' - ')
                                  : isEmailEvent
                                    ? `Sent to: ${history.notes.split(' to ')[1]}`
                                    : history.notes
                                }
                              </p>
                            </div>
                          )}
                          {history.notes && !isVoteEvent && !isEmailEvent && (
                            <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                              <p className={`text-gray-700 ${fontClass}`}>
                                {history.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
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
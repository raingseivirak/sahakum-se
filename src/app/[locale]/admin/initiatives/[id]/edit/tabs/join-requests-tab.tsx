"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  User,
} from "lucide-react"
import { format } from "date-fns"

interface JoinRequest {
  id: string
  status: string
  message?: string
  createdAt: string
  reviewedAt?: string
  reviewNote?: string
  user: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
  reviewer?: {
    id: string
    name: string
  }
}

interface JoinRequestsTabProps {
  initiativeId: string
  onUpdate: () => void
}

export function JoinRequestsTab({ initiativeId, onUpdate }: JoinRequestsTabProps) {
  const fontClass = 'font-sweden'
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewNote, setReviewNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED')

  useEffect(() => {
    fetchJoinRequests()
  }, [initiativeId])

  const fetchJoinRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/initiatives/${initiativeId}/join-requests`)
      if (!response.ok) {
        throw new Error("Failed to fetch join requests")
      }
      const data = await response.json()
      setJoinRequests(data.data || [])
    } catch (error) {
      console.error("Error fetching join requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewRequest = async () => {
    if (!selectedRequest) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/initiatives/join-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: actionType,
          reviewNote: reviewNote.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to review request')
      }

      // Success - refresh the list
      await fetchJoinRequests()
      if (actionType === 'APPROVED') {
        onUpdate() // Refresh the main initiative data to show new member
      }
      setShowReviewDialog(false)
      setSelectedRequest(null)
      setReviewNote("")
    } catch (error) {
      console.error("Error reviewing request:", error)
      alert(error instanceof Error ? error.message : 'Failed to review request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openReviewDialog = (request: JoinRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request)
    setActionType(action)
    setShowReviewDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingRequests = joinRequests.filter(r => r.status === 'PENDING')
  const reviewedRequests = joinRequests.filter(r => r.status !== 'PENDING')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading join requests...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className={fontClass}>
            Pending Join Requests
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-orange-500">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
          <CardDescription className={fontClass}>
            Review and approve/reject requests to join this initiative
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className={`text-sm text-gray-500 ${fontClass}`}>
              No pending join requests
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>User</TableHead>
                  <TableHead className={fontClass}>Message</TableHead>
                  <TableHead className={fontClass}>Requested</TableHead>
                  <TableHead className={fontClass}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {request.user.profileImage ? (
                          <img
                            src={request.user.profileImage}
                            alt={request.user.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${fontClass}`}>{request.user.name}</p>
                          <p className={`text-xs text-gray-500 ${fontClass}`}>{request.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className={`text-sm ${fontClass} max-w-xs truncate`}>
                        {request.message || <span className="italic text-gray-400">No message</span>}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={`text-sm ${fontClass}`}>
                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewDialog(request, 'APPROVED')}
                          className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewDialog(request, 'REJECTED')}
                          className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Request History</CardTitle>
            <CardDescription className={fontClass}>
              Previously reviewed join requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>User</TableHead>
                  <TableHead className={fontClass}>Status</TableHead>
                  <TableHead className={fontClass}>Reviewed By</TableHead>
                  <TableHead className={fontClass}>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {request.user.profileImage ? (
                          <img
                            src={request.user.profileImage}
                            alt={request.user.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${fontClass}`}>{request.user.name}</p>
                          <p className={`text-xs text-gray-500 ${fontClass}`}>{request.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <p className={`text-sm ${fontClass}`}>
                        {request.reviewer?.name || 'Unknown'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={`text-sm ${fontClass}`}>
                        {request.reviewedAt ? format(new Date(request.reviewedAt), 'MMM d, yyyy') : '-'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={(open) => {
        setShowReviewDialog(open)
        if (!open) {
          setSelectedRequest(null)
          setReviewNote("")
        }
      }}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-[600px] bg-white rounded-none">
            <DialogHeader>
              <DialogTitle className={`text-[var(--sahakum-navy)] ${fontClass}`}>
                {actionType === 'APPROVED' ? 'Approve' : 'Reject'} Join Request
              </DialogTitle>
              <DialogDescription className={fontClass}>
                From {selectedRequest.user.name} ({selectedRequest.user.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedRequest.message && (
                <div>
                  <label className={`text-sm font-medium ${fontClass}`}>
                    Applicant's Message:
                  </label>
                  <p className={`mt-1 text-sm bg-gray-50 p-3 rounded border ${fontClass}`}>
                    {selectedRequest.message}
                  </p>
                </div>
              )}
              <div>
                <label className={`text-sm font-medium ${fontClass}`}>
                  Review Note (optional):
                </label>
                <Textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add a note about your decision..."
                  rows={3}
                  className={`mt-1 rounded-none border-[var(--sahakum-navy)]/20 ${fontClass}`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null)
                  setReviewNote("")
                }}
                disabled={isSubmitting}
                className="rounded-none"
              >
                <span className={fontClass}>Cancel</span>
              </Button>
              <Button
                onClick={handleReviewRequest}
                disabled={isSubmitting}
                className={`rounded-none ${
                  actionType === 'APPROVED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className={fontClass}>Processing...</span>
                  </div>
                ) : (
                  <span className={fontClass}>
                    {actionType === 'APPROVED' ? 'Approve & Add to Team' : 'Reject Request'}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

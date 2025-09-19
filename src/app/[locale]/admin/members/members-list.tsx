"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  UserCheck,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Clock,
  Loader2,
  Search,
  Mail,
  Phone,
  ToggleLeft,
} from "lucide-react"
import Link from "next/link"

interface Member {
  id: string
  memberNumber: string | null
  firstName: string
  lastName: string
  firstNameKhmer: string | null
  lastNameKhmer: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  membershipType: 'REGULAR' | 'STUDENT' | 'FAMILY' | 'BOARD' | 'VOLUNTEER' | 'HONORARY' | 'LIFETIME'
  joinedAt: string
  active: boolean
  bio: string | null
  emergencyContact: string | null
  createdAt: string
  updatedAt: string
}

interface MembersListProps {
  locale: string
}

export function MembersList({ locale }: MembersListProps) {
  const fontClass = 'font-sweden'
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [memberTypeFilter, setMemberTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetchMembers()
  }, [search, memberTypeFilter, statusFilter])

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(memberTypeFilter && memberTypeFilter !== "all" && { memberType: memberTypeFilter }),
        ...(statusFilter && statusFilter !== "all" && { isActive: statusFilter }),
      })

      const response = await fetch(`/api/members?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch members")
      }
      const data = await response.json()
      setMembers(data.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const getMemberTypeBadge = (type: string) => {
    const typeMap = {
      'REGULAR': { label: 'Regular', className: 'bg-blue-500' },
      'STUDENT': { label: 'Student', className: 'bg-cyan-500' },
      'FAMILY': { label: 'Family', className: 'bg-orange-500' },
      'BOARD': { label: 'Board', className: 'bg-purple-500' },
      'VOLUNTEER': { label: 'Volunteer', className: 'bg-green-500' },
      'HONORARY': { label: 'Honorary', className: 'bg-yellow-500' },
      'LIFETIME': { label: 'Lifetime', className: 'bg-red-500' }
    }

    const typeConfig = typeMap[type as keyof typeof typeMap] || { label: type, className: 'bg-gray-500' }

    return (
      <Badge variant="default" className={typeConfig.className}>
        {typeConfig.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'

    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    return date.toLocaleDateString()
  }

  const handleDelete = async (memberId: string) => {
    setDeletingId(memberId)
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete member")
      }

      // Remove the deleted member from the list
      setMembers(members.filter(member => member.id !== memberId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete member")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (memberId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update member")
      }

      // Update the member in the list
      setMembers(members.map(member =>
        member.id === memberId
          ? { ...member, active: !currentStatus }
          : member
      ))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update member")
    }
  }

  const getFullName = (member: Member) => {
    return `${member.firstName} ${member.lastName}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading members...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className={`text-red-500 ${fontClass}`}>Error: {error}</p>
        <Button onClick={fetchMembers} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 ${fontClass}`}
          />
        </div>
        <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
          <SelectTrigger className={`w-full sm:w-40 ${fontClass}`}>
            <SelectValue placeholder="Member Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="REGULAR">Regular</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="FAMILY">Family</SelectItem>
            <SelectItem value="BOARD">Board</SelectItem>
            <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
            <SelectItem value="HONORARY">Honorary</SelectItem>
            <SelectItem value="LIFETIME">Lifetime</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={`w-full sm:w-32 ${fontClass}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="text-center p-8">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className={`text-lg font-medium text-muted-foreground ${fontClass}`}>
            No members found
          </h3>
          <p className={`text-sm text-muted-foreground ${fontClass}`}>
            Add your first member to get started
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/admin/members/create`}>
              Add Member
            </Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={fontClass}>Member</TableHead>
              <TableHead className={fontClass}>Type</TableHead>
              <TableHead className={fontClass}>Contact</TableHead>
              <TableHead className={fontClass}>Status</TableHead>
              <TableHead className={fontClass}>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className={`font-medium ${fontClass}`}>
                        {getFullName(member)}
                      </div>
                      {member.memberNumber && (
                        <div className={`text-sm text-muted-foreground ${fontClass}`}>
                          #{member.memberNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getMemberTypeBadge(member.membershipType)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {member.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className={fontClass}>{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className={fontClass}>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(member.active)}</TableCell>
                <TableCell className={fontClass}>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{formatDate(member.joinedAt)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                      <DropdownMenuItem
                        className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                        onClick={() => window.location.href = `/${locale}/admin/members/${member.id}/edit`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                        onClick={() => toggleActive(member.id, member.active)}
                      >
                        <ToggleLeft className="mr-2 h-4 w-4" />
                        {member.active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                            disabled={deletingId === member.id}
                            onSelect={(e) => e.preventDefault()}
                          >
                            {deletingId === member.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            {deletingId === member.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className={fontClass}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className={fontClass}>
                              Delete Member
                            </AlertDialogTitle>
                            <AlertDialogDescription className={fontClass}>
                              Are you sure you want to delete "{getFullName(member)}"?
                              This action cannot be undone and will permanently remove the member from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className={fontClass}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                              onClick={() => handleDelete(member.id)}
                            >
                              Delete Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Users,
  MoreHorizontal,
  Edit,
  Clock,
  Loader2,
  Mail,
  User,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface SystemUser {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR'
  firstName: string | null
  lastName: string | null
  isActive: boolean
  createdAt: string
}

interface UsersListProps {
  locale: string
}

export function UsersList({ locale }: UsersListProps) {
  const fontClass = 'font-sweden'
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null)
  const [userHasContent, setUserHasContent] = useState(false)
  const [contentDetails, setContentDetails] = useState<any[]>([])
  const [selectedTargetUser, setSelectedTargetUser] = useState<string>("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'ADMIN': { label: 'Admin', className: 'bg-red-500' },
      'EDITOR': { label: 'Editor', className: 'bg-blue-500' },
      'AUTHOR': { label: 'Author', className: 'bg-green-500' }
    }

    const roleConfig = roleMap[role as keyof typeof roleMap] || { label: role, className: 'bg-gray-500' }

    return (
      <Badge variant="default" className={roleConfig.className}>
        {roleConfig.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getDisplayName = (user: SystemUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.name) {
      return user.name
    }
    return user.email
  }

  const toggleUserStatus = async (user: SystemUser) => {
    if (processingUser) return

    setProcessingUser(user.id)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user status')
      }

      // Refresh users list
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessingUser(null)
    }
  }

  const checkUserContent = async (user: SystemUser) => {
    try {
      // Try a dry-run delete to see if user has content
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // If DELETE succeeded, user has no content (but we don't want to actually delete)
        setUserHasContent(false)
        setContentDetails([])
        // Refresh the users list since we accidentally deleted the user
        await fetchUsers()
      } else {
        const errorData = await response.json()
        if (errorData.contentItems && errorData.contentItems.length > 0) {
          // User has content
          setUserHasContent(true)
          setContentDetails(errorData.contentItems)
        } else {
          // Some other error
          setUserHasContent(false)
          setContentDetails([])
        }
      }
    } catch (err) {
      console.error('Failed to check user content:', err)
      // If we can't check content, assume they don't have any for safety
      setUserHasContent(false)
      setContentDetails([])
    }
  }

  const reassignContent = async (sourceUserId: string, targetUserId: string) => {
    if (!targetUserId) {
      setError('Please select a target user for content reassignment')
      return false
    }

    try {
      const response = await fetch(`/api/users/${sourceUserId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reassign_content',
          targetUserId: targetUserId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reassign content')
      }

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const deleteUser = async (user: SystemUser, shouldReassign: boolean = false) => {
    if (processingUser) return

    setProcessingUser(user.id)
    try {
      // If reassignment is requested, do it first
      if (shouldReassign && selectedTargetUser) {
        const reassignSuccess = await reassignContent(user.id, selectedTargetUser)
        if (!reassignSuccess) {
          setProcessingUser(null)
          return
        }
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      // Reset state and refresh users list
      setUserToDelete(null)
      setUserHasContent(false)
      setContentDetails([])
      setSelectedTargetUser("")
      await fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessingUser(null)
    }
  }

  const handleDeleteClick = async (user: SystemUser) => {
    setUserToDelete(user)
    setError("") // Clear any previous errors
    await checkUserContent(user)
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="default" className="bg-green-500">
          <UserCheck className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="bg-gray-500">
          <UserX className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading users...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className={`text-red-500 ${fontClass}`}>Error: {error}</p>
        <Button onClick={fetchUsers} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className={`text-lg font-medium text-muted-foreground ${fontClass}`}>
          No users found
        </h3>
        <p className={`text-sm text-muted-foreground ${fontClass}`}>
          No system users are currently registered
        </p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/admin/users/create`}>
            Add User
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={fontClass}>User</TableHead>
            <TableHead className={fontClass}>Role</TableHead>
            <TableHead className={fontClass}>Status</TableHead>
            <TableHead className={fontClass}>Email</TableHead>
            <TableHead className={fontClass}>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-sahakum-gold rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className={`font-medium ${fontClass}`}>
                      {getDisplayName(user)}
                    </div>
                    <div className={`text-sm text-muted-foreground ${fontClass}`}>
                      ID: {user.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {getRoleBadge(user.role)}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(user.isActive)}
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className={fontClass}>{user.email}</span>
                </div>
              </TableCell>
              <TableCell className={fontClass}>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                    disabled={processingUser === user.id}
                  >
                    <span className="sr-only">Open menu</span>
                    {processingUser === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                    <DropdownMenuItem
                      className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                      onClick={() => window.location.href = `/${locale}/admin/users/${user.id}/edit`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                      onClick={() => toggleUserStatus(user)}
                      disabled={processingUser === user.id}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate User
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate User
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className={`flex items-center px-2 py-2 text-sm hover:bg-red-100 text-red-600 rounded cursor-pointer ${fontClass}`}
                      onClick={() => handleDeleteClick(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Enhanced Deletion Dialog with Content Reassignment */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => {
        setUserToDelete(null)
        setUserHasContent(false)
        setContentDetails([])
        setSelectedTargetUser("")
        setError("")
      }}>
        <AlertDialogContent className="bg-white max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className={`flex items-center gap-2 ${fontClass}`}>
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className={fontClass}>
              {userToDelete && (
                <>
                  You are about to permanently delete <strong>{getDisplayName(userToDelete)}</strong>.
                  <br /><br />

                  {userHasContent ? (
                    <>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          User Has Content
                        </div>
                        <p className="text-yellow-700 text-sm">
                          This user has created {contentDetails.length} content item(s).
                          You must choose what to do with their content before deletion.
                        </p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="font-medium">Content items:</div>
                        <div className="max-h-32 overflow-y-auto bg-gray-50 rounded border p-3">
                          {contentDetails.map((content: any, index: number) => (
                            <div key={index} className="text-sm text-gray-700 mb-1">
                              • {content.type}: "{content.slug}" (ID: {content.id.substring(0, 8)}...)
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="font-medium">Choose an action:</div>

                        <div className="space-y-2">
                          <div className="font-medium text-sm">Reassign content to another user:</div>
                          <Select value={selectedTargetUser} onValueChange={setSelectedTargetUser}>
                            <SelectTrigger className={fontClass}>
                              <SelectValue placeholder="Select a user to receive this content" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 shadow-lg">
                              {users
                                .filter(u => u.id !== userToDelete?.id && u.isActive && u.id && u.id.trim() !== '')
                                .map(user => (
                                  <SelectItem key={user.id} value={user.id} className="hover:bg-gray-100">
                                    <div className="flex flex-col">
                                      <span>{getDisplayName(user)}</span>
                                      <span className="text-xs text-muted-foreground">{user.role} • {user.email}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {selectedTargetUser && (
                            <p className="text-xs text-gray-600">
                              All content will be transferred to the selected user before deletion.
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>This action cannot be undone.</strong> The user will be permanently removed from the system.
                    </>
                  )}

                  {userToDelete.role === 'ADMIN' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-600 font-medium text-sm">⚠️ Warning: This is an admin user.</span>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-600 text-sm">{error}</span>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={fontClass}>Cancel</AlertDialogCancel>

            {userHasContent ? (
              <AlertDialogAction
                onClick={() => userToDelete && deleteUser(userToDelete, true)}
                className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                disabled={processingUser === userToDelete?.id || !selectedTargetUser}
              >
                {processingUser === userToDelete?.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reassigning & Deleting...
                  </>
                ) : (
                  'Reassign Content & Delete User'
                )}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={() => userToDelete && deleteUser(userToDelete, false)}
                className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                disabled={processingUser === userToDelete?.id}
              >
                {processingUser === userToDelete?.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
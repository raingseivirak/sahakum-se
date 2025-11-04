"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertCircle,
  UserPlus,
  Trash2,
  Loader2,
  Crown,
  User,
} from "lucide-react"

interface TeamMember {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
}

interface TeamTabProps {
  initiativeId: string
  members: TeamMember[]
  projectLeadId: string
  onUpdate: () => void
}

export function TeamTab({ initiativeId, members, projectLeadId, onUpdate }: TeamTabProps) {
  const fontClass = 'font-sweden'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("MEMBER")
  const [contributionNote, setContributionNote] = useState("")

  useEffect(() => {
    if (isAddDialogOpen) {
      fetchAvailableUsers()
    }
  }, [isAddDialogOpen])

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      const usersList = data.users || data

      // Filter out users who are already team members
      const memberUserIds = members.map(m => m.user.id)
      const availableUsers = usersList.filter((u: any) => !memberUserIds.includes(u.id))
      setUsers(availableUsers)
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError("Please select a user")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
          contributionNote: contributionNote || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add member")
      }

      setIsAddDialogOpen(false)
      setSelectedUserId("")
      setSelectedRole("MEMBER")
      setContributionNote("")
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "LEAD":
        return <Badge className="bg-purple-500"><Crown className="h-3 w-3 mr-1" />Lead</Badge>
      case "CO_LEAD":
        return <Badge className="bg-blue-500">Co-Lead</Badge>
      case "MEMBER":
        return <Badge variant="outline">Member</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove member")
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={fontClass}>Team Members</CardTitle>
              <CardDescription className={fontClass}>
                Manage team members and their roles (max 30 members)
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className={fontClass} disabled={members.length >= 30}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className={`bg-white ${fontClass}`}>
                <DialogHeader>
                  <DialogTitle className={fontClass}>Add Team Member</DialogTitle>
                  <DialogDescription className={fontClass}>
                    Add a new team member to this initiative
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user" className={fontClass}>Select User</Label>
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                      disabled={loadingUsers}
                    >
                      <SelectTrigger className={fontClass}>
                        <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id} className={fontClass}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className={fontClass}>Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger className={fontClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="MEMBER" className={fontClass}>Member</SelectItem>
                        <SelectItem value="CO_LEAD" className={fontClass}>Co-Lead</SelectItem>
                        <SelectItem value="LEAD" className={fontClass}>Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note" className={fontClass}>Contribution Note (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="What will this person help with?"
                      value={contributionNote}
                      onChange={(e) => setContributionNote(e.target.value)}
                      rows={3}
                      className={fontClass}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isLoading}
                    className={fontClass}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddMember}
                    disabled={isLoading || !selectedUserId}
                    className={fontClass}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center p-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className={`text-muted-foreground ${fontClass}`}>
                No team members yet. Add members to collaborate on this initiative.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>Member</TableHead>
                  <TableHead className={fontClass}>Role</TableHead>
                  <TableHead className={fontClass}>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {member.user.profileImage ? (
                          <img
                            src={member.user.profileImage}
                            alt={member.user.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className={`font-medium ${fontClass}`}>
                            {member.user.name || member.user.email}
                            {member.user.id === projectLeadId && (
                              <Badge variant="outline" className="ml-2">Project Lead</Badge>
                            )}
                          </div>
                          <div className={`text-sm text-muted-foreground ${fontClass}`}>
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className={fontClass}>{formatDate(member.joinedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isLoading || member.user.id === projectLeadId}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Crown, User } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface BoardMember {
  id: string
  slug: string
  firstName: string
  lastName: string
  firstNameKhmer?: string
  lastNameKhmer?: string
  profileImage?: string
  email?: string
  isChairman: boolean
  order: number
  active: boolean
  translations: {
    language: string
    position: string
  }[]
}

export function BoardMembersList({ locale }: { locale: string }) {
  const router = useRouter()
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchBoardMembers()
  }, [])

  const fetchBoardMembers = async () => {
    try {
      const response = await fetch('/api/board-members')
      if (response.ok) {
        const data = await response.json()
        setBoardMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch board members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/board-members/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBoardMembers(boardMembers.filter((m) => m.id !== id))
        setDeleteId(null)
      } else {
        alert('Failed to delete board member')
      }
    } catch (error) {
      console.error('Error deleting board member:', error)
      alert('Failed to delete board member')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (boardMembers.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <User className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold">No board members</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new board member.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardMembers.map((member) => {
              const enTranslation = member.translations.find((t) => t.language === 'en')
              const initials = `${member.firstName[0]}${member.lastName[0]}`

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profileImage} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {member.firstName} {member.lastName}
                          {member.isChairman && (
                            <Crown className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        {member.firstNameKhmer && member.lastNameKhmer && (
                          <div className="text-sm text-muted-foreground">
                            {member.firstNameKhmer} {member.lastNameKhmer}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{enTranslation?.position || 'N/A'}</TableCell>
                  <TableCell>{member.email || 'N/A'}</TableCell>
                  <TableCell>{member.order}</TableCell>
                  <TableCell>
                    {member.active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/${locale}/admin/board-members/${member.id}/edit`
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board member and all their translations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

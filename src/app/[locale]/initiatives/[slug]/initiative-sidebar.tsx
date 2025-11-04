'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { User, Kanban, UserPlus, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"

interface InitiativeSidebarProps {
  locale: string
  fontClass: string
  slug: string
  initiativeId: string
  members: Array<{
    id: string
    user: {
      id: string
      name: string | null
      profileImage: string | null
    }
  }>
  tasks: Array<{
    id: string
    titleEn: string | null
    titleSv: string | null
    titleKm: string | null
    status: string
  }>
}

export function InitiativeSidebar({
  locale,
  fontClass,
  slug,
  initiativeId,
  members,
  tasks,
}: InitiativeSidebarProps) {
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated' && !!session

  // Check if the current user is a member
  const isMember = isLoggedIn && members.some(m => m.user.id === session?.user?.id)

  // Join request state
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [joinRequestStatus, setJoinRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [errorMessage, setErrorMessage] = useState('')

  // Check if user has an existing join request
  useEffect(() => {
    if (isLoggedIn && !isMember) {
      checkExistingRequest()
    }
  }, [isLoggedIn, isMember, initiativeId])

  const checkExistingRequest = async () => {
    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/my-join-request`)
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setJoinRequestStatus(data.data.status.toLowerCase())
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  const handleJoinRequest = async () => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/join-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: joinMessage.trim() || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to submit join request')
        return
      }

      // Success
      setJoinRequestStatus('pending')
      setShowJoinDialog(false)
      setJoinMessage('')
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loginPrompt = {
    sv: "Logga in för att se teamet och uppgifter",
    en: "Sign in to view team and tasks",
    km: "ចូលគណនីដើម្បីមើលក្រុម និង កិច្ចការ"
  }[locale] || "Sign in to view team and tasks"

  const joinButtonText = {
    sv: "Ansök om att gå med",
    en: "Request to Join",
    km: "ស្នើសុំចូលរួម"
  }[locale] || "Request to Join"

  const kanbanButtonText = {
    sv: "Öppna Kanban-tavlan",
    en: "Go to Kanban Board",
    km: "ទៅកាន់ Kanban"
  }[locale] || "Go to Kanban Board"

  // Show nothing while checking authentication
  if (status === 'loading') {
    return null
  }

  // Show Team and Tasks for logged-in users
  if (isLoggedIn) {
    return (
      <>
        {/* Action Button - For Members or Non-Members */}
        {isMember ? (
          <Button
            asChild
            className="w-full bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] rounded-none font-medium mb-6"
          >
            <Link href={`/${locale}/my-account/initiatives/${slug}`} className={`flex items-center justify-center space-x-2 ${fontClass}`}>
              <Kanban className="h-4 w-4" />
              <span>{kanbanButtonText}</span>
            </Link>
          </Button>
        ) : (
          <>
            {joinRequestStatus === 'pending' ? (
              <Button
                disabled
                className="w-full bg-orange-500/10 text-orange-700 border border-orange-300 rounded-none font-medium mb-6 cursor-not-allowed"
              >
                <div className={`flex items-center justify-center space-x-2 ${fontClass}`}>
                  <Clock className="h-4 w-4" />
                  <span>
                    {locale === 'sv' ? 'Begäran väntar' : locale === 'km' ? 'កំពុងរង់ចាំ' : 'Request Pending'}
                  </span>
                </div>
              </Button>
            ) : joinRequestStatus === 'approved' ? (
              <Button
                disabled
                className="w-full bg-green-500/10 text-green-700 border border-green-300 rounded-none font-medium mb-6 cursor-not-allowed"
              >
                <div className={`flex items-center justify-center space-x-2 ${fontClass}`}>
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {locale === 'sv' ? 'Godkänd' : locale === 'km' ? 'បានអនុម័ត' : 'Approved'}
                  </span>
                </div>
              </Button>
            ) : joinRequestStatus === 'rejected' ? (
              <Button
                onClick={() => {
                  setJoinRequestStatus('none')
                  setShowJoinDialog(true)
                }}
                className="w-full bg-red-500/10 text-red-700 border border-red-300 hover:bg-red-500/20 rounded-none font-medium mb-6"
              >
                <div className={`flex items-center justify-center space-x-2 ${fontClass}`}>
                  <XCircle className="h-4 w-4" />
                  <span>
                    {locale === 'sv' ? 'Avvisad - Försök igen' : locale === 'km' ? 'បានបដិសេធ - ព្យាយាមម្ដងទៀត' : 'Rejected - Try Again'}
                  </span>
                </div>
              </Button>
            ) : (
              <Button
                onClick={() => setShowJoinDialog(true)}
                className="w-full bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white rounded-none font-medium mb-6"
              >
                <div className={`flex items-center justify-center space-x-2 ${fontClass}`}>
                  <UserPlus className="h-4 w-4" />
                  <span>{joinButtonText}</span>
                </div>
              </Button>
            )}

            {/* Join Request Dialog */}
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogContent className="sm:max-w-[500px] bg-white rounded-none">
                <DialogHeader>
                  <DialogTitle className={`text-[var(--sahakum-navy)] ${fontClass}`}>
                    {locale === 'sv' ? 'Ansök om att gå med i initiativet' : locale === 'km' ? 'ស្នើសុំចូលរួមគម្រោង' : 'Request to Join Initiative'}
                  </DialogTitle>
                  <DialogDescription className={fontClass}>
                    {locale === 'sv'
                      ? 'Berätta varför du vill gå med i detta initiativ (valfritt)'
                      : locale === 'km'
                      ? 'ប្រាប់ពីមូលហេតុដែលអ្នកចង់ចូលរួមគម្រោងនេះ (ស្រេចចិត្ត)'
                      : 'Tell us why you want to join this initiative (optional)'}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    placeholder={
                      locale === 'sv'
                        ? 'Jag vill gå med eftersom...'
                        : locale === 'km'
                        ? 'ខ្ញុំចង់ចូលរួមព្រោះ...'
                        : 'I want to join because...'
                    }
                    rows={5}
                    className={`rounded-none border-[var(--sahakum-navy)]/20 focus:border-[var(--sahakum-navy)] ${fontClass}`}
                  />
                  {errorMessage && (
                    <p className={`text-sm text-red-600 mt-2 ${fontClass}`}>
                      {errorMessage}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowJoinDialog(false)
                      setJoinMessage('')
                      setErrorMessage('')
                    }}
                    disabled={isSubmitting}
                    className="rounded-none border-[var(--sahakum-navy)]/20"
                  >
                    <span className={fontClass}>
                      {locale === 'sv' ? 'Avbryt' : locale === 'km' ? 'បោះបង់' : 'Cancel'}
                    </span>
                  </Button>
                  <Button
                    onClick={handleJoinRequest}
                    disabled={isSubmitting}
                    className="bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white rounded-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className={fontClass}>
                          {locale === 'sv' ? 'Skickar...' : locale === 'km' ? 'កំពុងផ្ញើ...' : 'Submitting...'}
                        </span>
                      </div>
                    ) : (
                      <span className={fontClass}>
                        {locale === 'sv' ? 'Skicka begäran' : locale === 'km' ? 'ដាក់ពាក្យ' : 'Submit Request'}
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Team Card */}
        <Card className="border border-gray-200 rounded-none">
          <CardHeader>
            <CardTitle className={fontClass}>
              {locale === 'sv' ? 'Teamet' : locale === 'km' ? 'ក្រុមការងារ' : 'Team'}
            </CardTitle>
            <CardDescription className={fontClass}>
              {members.length} {locale === 'sv' ? 'medlemmar' : locale === 'km' ? 'សមាជិក' : 'members'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    {member.user.profileImage ? (
                      <img
                        src={member.user.profileImage}
                        alt={member.user.name || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <span className={`text-sm ${fontClass}`}>{member.user.name}</span>
                  </div>
                ))}
                {members.length > 5 && (
                  <p className={`text-sm text-gray-500 ${fontClass}`}>
                    +{members.length - 5} {locale === 'sv' ? 'fler' : locale === 'km' ? 'ទៀត' : 'more'}
                  </p>
                )}
              </div>
            ) : (
              <p className={`text-sm text-gray-500 italic ${fontClass}`}>
                {locale === 'sv' ? 'Inga teammedlemmar än' : locale === 'km' ? 'មិនទាន់មានសមាជិកក្រុមនៅឡើយ' : 'No team members yet'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="border border-gray-200 rounded-none">
          <CardHeader>
            <CardTitle className={fontClass}>
              {locale === 'sv' ? 'Uppgifter' : locale === 'km' ? 'កិច្ចការ' : 'Tasks'}
            </CardTitle>
            <CardDescription className={fontClass}>
              {tasks.length} {locale === 'sv' ? 'aktiva uppgifter' : locale === 'km' ? 'កិច្ចការសកម្ម' : 'active tasks'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="text-sm border-l-2 border-[var(--sahakum-gold)] pl-2 py-1">
                    <p className={`font-medium ${fontClass}`}>
                      {locale === 'sv' && task.titleSv ? task.titleSv :
                       locale === 'km' && task.titleKm ? task.titleKm :
                       task.titleEn || 'Untitled'}
                    </p>
                    <p className={`text-xs text-gray-500 ${fontClass}`}>
                      {task.status === 'TODO' ? (locale === 'sv' ? 'Att göra' : locale === 'km' ? 'ត្រូវធ្វើ' : 'To Do') :
                       task.status === 'IN_PROGRESS' ? (locale === 'sv' ? 'Pågående' : locale === 'km' ? 'កំពុងដំណើរការ' : 'In Progress') :
                       task.status === 'BLOCKED' ? (locale === 'sv' ? 'Blockerad' : locale === 'km' ? 'បានរារាំង' : 'Blocked') :
                       task.status}
                    </p>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <p className={`text-sm text-gray-500 ${fontClass}`}>
                    +{tasks.length - 3} {locale === 'sv' ? 'fler' : locale === 'km' ? 'ទៀត' : 'more'}
                  </p>
                )}
              </div>
            ) : (
              <p className={`text-sm text-gray-500 italic ${fontClass}`}>
                {locale === 'sv' ? 'Inga uppgifter än' : locale === 'km' ? 'មិនទាន់មានកិច្ចការនៅឡើយ' : 'No tasks yet'}
              </p>
            )}
          </CardContent>
        </Card>
      </>
    )
  }

  // Show Sign In prompt for non-logged-in users
  return (
    <Card className="border border-gray-200 rounded-none">
      <CardHeader>
        <CardTitle className={`text-[var(--sahakum-navy)] ${fontClass}`}>
          {locale === 'sv' ? 'Mer information' : locale === 'km' ? 'ព័ត៌មានបន្ថែម' : 'More Information'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-sm text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
          {loginPrompt}
        </p>
        <Link
          href={`/${locale}/auth/signin?callbackUrl=/${locale}/initiatives/${slug}`}
          className={`inline-flex items-center justify-center w-full px-4 py-2 bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90 transition-colors rounded-none font-medium text-sm ${fontClass}`}
        >
          {locale === 'sv' ? 'Logga in' : locale === 'km' ? 'ចូល' : 'Sign In'}
        </Link>
      </CardContent>
    </Card>
  )
}

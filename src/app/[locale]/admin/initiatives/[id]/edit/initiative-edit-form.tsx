"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertCircle,
  Loader2,
  FileText,
  Users,
  CheckSquare,
  Newspaper,
  UserPlus,
} from "lucide-react"
import { InitiativeDetailsTab } from "./tabs/details-tab"
import { TeamTab } from "./tabs/team-tab"
import { TasksTab } from "./tabs/tasks-tab"
import { JoinRequestsTab } from "./tabs/join-requests-tab"

interface InitiativeEditFormProps {
  locale: string
  initiativeId: string
}

interface Initiative {
  id: string
  slug: string
  status: string
  visibility: string
  category: string
  startDate: string
  endDate?: string
  featuredImage?: string
  projectLeadId: string
  projectLead: {
    id: string
    name: string
    email: string
  }
  translations: Array<{
    id: string
    language: string
    title: string
    shortDescription: string
    description: string
  }>
  members: Array<{
    id: string
    role: string
    joinedAt: string
    contributionNote?: string
    user: {
      id: string
      name: string
      email: string
      profileImage?: string
    }
  }>
  tasks: Array<{
    id: string
    titleEn?: string
    titleSv?: string
    titleKm?: string
    descriptionEn?: string
    descriptionSv?: string
    descriptionKm?: string
    status: string
    priority: string
    dueDate?: string
    completedAt?: string
    order: number
    assignedToId?: string
    assignedTo?: {
      id: string
      name: string
      email: string
    }
  }>
  updates: Array<{
    id: string
    title: string
    content: string
    type: string
    publishedAt: string
    author: {
      id: string
      name: string
      email: string
    }
  }>
}

export function InitiativeEditForm({ locale, initiativeId }: InitiativeEditFormProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchInitiative()
  }, [initiativeId])

  const fetchInitiative = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/initiatives/${initiativeId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch initiative")
      }
      const data = await response.json()
      setInitiative(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading initiative...</span>
      </div>
    )
  }

  if (error || !initiative) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Initiative not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Initiative Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className={fontClass}>
            {initiative.translations.find(t => t.language === 'en')?.title ||
             initiative.translations.find(t => t.language === 'sv')?.title ||
             initiative.translations[0]?.title ||
             "Untitled Initiative"}
          </CardTitle>
          <CardDescription className={fontClass}>
            {initiative.slug} • {initiative.category}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg h-auto">
          <TabsTrigger
            value="details"
            className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3`}
          >
            <Users className="h-4 w-4 mr-2" />
            Team ({initiative.members.length})
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3`}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks ({initiative.tasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="join-requests"
            className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3`}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <InitiativeDetailsTab
            initiative={initiative}
            locale={locale}
            onUpdate={fetchInitiative}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamTab
            initiativeId={initiative.id}
            members={initiative.members}
            projectLeadId={initiative.projectLeadId}
            onUpdate={fetchInitiative}
          />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TasksTab
            initiativeId={initiative.id}
            tasks={initiative.tasks}
            members={initiative.members}
            onUpdate={fetchInitiative}
          />
        </TabsContent>

        <TabsContent value="join-requests" className="space-y-4">
          <JoinRequestsTab
            initiativeId={initiative.id}
            onUpdate={fetchInitiative}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

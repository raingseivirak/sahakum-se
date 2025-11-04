"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit,
  Loader2,
  User,
} from "lucide-react"

interface Task {
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
  assignedTo?: {
    id: string
    name: string
    email: string
  }
}

interface TeamMember {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface TasksTabProps {
  initiativeId: string
  tasks: Task[]
  members: TeamMember[]
  onUpdate: () => void
}

export function TasksTab({ initiativeId, tasks, members, onUpdate }: TasksTabProps) {
  const fontClass = 'font-sweden'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [titleEn, setTitleEn] = useState("")
  const [titleSv, setTitleSv] = useState("")
  const [titleKm, setTitleKm] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [descriptionSv, setDescriptionSv] = useState("")
  const [descriptionKm, setDescriptionKm] = useState("")
  const [assignedToId, setAssignedToId] = useState("")
  const [status, setStatus] = useState("TODO")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailDialogOpen(true)
  }

  const resetForm = () => {
    setTitleEn("")
    setTitleSv("")
    setTitleKm("")
    setDescriptionEn("")
    setDescriptionSv("")
    setDescriptionKm("")
    setAssignedToId("")
    setStatus("TODO")
    setPriority("MEDIUM")
    setDueDate("")
    setError("")
  }

  const handleCreateTask = async () => {
    if (!titleEn && !titleSv && !titleKm) {
      setError("At least one title (EN, SV, or KM) is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titleEn: titleEn || undefined,
          titleSv: titleSv || undefined,
          titleKm: titleKm || undefined,
          descriptionEn: descriptionEn || undefined,
          descriptionSv: descriptionSv || undefined,
          descriptionKm: descriptionKm || undefined,
          assignedToId: assignedToId || undefined,
          status,
          priority,
          dueDate: dueDate || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create task")
      }

      resetForm()
      setIsAddDialogOpen(false)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update task")
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/initiatives/${initiativeId}/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete task")
      }

      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "IN_PROGRESS":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "BLOCKED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return <Badge variant="outline">To Do</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "BLOCKED":
        return <Badge className="bg-red-500">Blocked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline" className="bg-gray-50">Low</Badge>
      case "MEDIUM":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>
      case "HIGH":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>
      case "URGENT":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Urgent</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getTaskTitle = (task: Task) => {
    return task.titleEn || task.titleSv || task.titleKm || "Untitled Task"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const groupedTasks = {
    TODO: tasks.filter(t => t.status === "TODO"),
    IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS"),
    COMPLETED: tasks.filter(t => t.status === "COMPLETED"),
    BLOCKED: tasks.filter(t => t.status === "BLOCKED"),
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-medium ${fontClass}`}>Task Board</h3>
          <p className={`text-sm text-muted-foreground ${fontClass}`}>
            Organize and track tasks for this initiative
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={fontClass}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className={`bg-white max-w-2xl ${fontClass}`}>
            <DialogHeader>
              <DialogTitle className={fontClass}>Add Task</DialogTitle>
              <DialogDescription className={fontClass}>
                Create a new task for this initiative (multilingual support)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title (multilingual tabs) */}
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg h-auto">
                  <TabsTrigger value="en" className="font-sweden data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3">
                    English
                  </TabsTrigger>
                  <TabsTrigger value="sv" className="font-sweden data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3">
                    Svenska
                  </TabsTrigger>
                  <TabsTrigger value="km" className="font-khmer data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3">
                    ខ្មែរ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn" className={fontClass}>Title (English)</Label>
                    <Input
                      id="titleEn"
                      placeholder="Task title in English"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className={fontClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descEn" className={fontClass}>Description (Optional)</Label>
                    <Textarea
                      id="descEn"
                      placeholder="Task details..."
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      rows={3}
                      className={fontClass}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sv" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleSv" className={fontClass}>Titel (Svenska)</Label>
                    <Input
                      id="titleSv"
                      placeholder="Uppgiftstitel på svenska"
                      value={titleSv}
                      onChange={(e) => setTitleSv(e.target.value)}
                      className={fontClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descSv" className={fontClass}>Beskrivning (Valfritt)</Label>
                    <Textarea
                      id="descSv"
                      placeholder="Uppgiftsdetaljer..."
                      value={descriptionSv}
                      onChange={(e) => setDescriptionSv(e.target.value)}
                      rows={3}
                      className={fontClass}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="km" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleKm" className={fontClass}>ចំណងជើង (ខ្មែរ)</Label>
                    <Input
                      id="titleKm"
                      placeholder="ចំណងជើងកិច្ចការជាភាសាខ្មែរ"
                      value={titleKm}
                      onChange={(e) => setTitleKm(e.target.value)}
                      className="font-khmer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descKm" className={fontClass}>ការពណ៌នា (ស្រេចចិត្ត)</Label>
                    <Textarea
                      id="descKm"
                      placeholder="ព័ត៌មានលម្អិតកិច្ចការ..."
                      value={descriptionKm}
                      onChange={(e) => setDescriptionKm(e.target.value)}
                      rows={3}
                      className="font-khmer"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Task settings */}
              <div className="grid gap-4 md:grid-cols-2 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee" className={fontClass}>Assign To (Optional)</Label>
                  <Select value={assignedToId || undefined} onValueChange={(value) => setAssignedToId(value || "")}>
                    <SelectTrigger className={fontClass}>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.user.id} className={fontClass}>
                          {member.user.name || member.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className={fontClass}>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className={fontClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="LOW" className={fontClass}>Low</SelectItem>
                      <SelectItem value="MEDIUM" className={fontClass}>Medium</SelectItem>
                      <SelectItem value="HIGH" className={fontClass}>High</SelectItem>
                      <SelectItem value="URGENT" className={fontClass}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={fontClass}>Initial Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className={fontClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="TODO" className={fontClass}>To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS" className={fontClass}>In Progress</SelectItem>
                      <SelectItem value="BLOCKED" className={fontClass}>Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className={fontClass}>Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={fontClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(false)
                }}
                disabled={isLoading}
                className={fontClass}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={isLoading || (!titleEn && !titleSv && !titleKm)}
                className={fontClass}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* To Do Column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <CardTitle className={`text-sm ${fontClass}`}>To Do</CardTitle>
              <Badge variant="outline">{groupedTasks.TODO.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedTasks.TODO.length === 0 ? (
              <p className={`text-sm text-muted-foreground ${fontClass}`}>No tasks</p>
            ) : (
              groupedTasks.TODO.map((task) => (
                <Card key={task.id} className="p-3 group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
                  <div className="space-y-2">
                    <div className={`font-medium text-sm ${fontClass}`}>
                      {getTaskTitle(task)}
                    </div>
                    <div className="flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      {task.assignedTo && (
                        <span className={`text-xs text-muted-foreground ${fontClass}`}>
                          {task.assignedTo.name?.split(' ')[0] || task.assignedTo.email.split('@')[0]}
                        </span>
                      )}
                    </div>
                    {task.dueDate && (
                      <div className={`text-xs text-muted-foreground ${fontClass}`}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(task.id, "IN_PROGRESS")
                        }}
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Start
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <CardTitle className={`text-sm ${fontClass}`}>In Progress</CardTitle>
              <Badge variant="outline">{groupedTasks.IN_PROGRESS.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedTasks.IN_PROGRESS.length === 0 ? (
              <p className={`text-sm text-muted-foreground ${fontClass}`}>No tasks</p>
            ) : (
              groupedTasks.IN_PROGRESS.map((task) => (
                <Card key={task.id} className="p-3 border-blue-200 bg-blue-50 group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
                  <div className="space-y-2">
                    <div className={`font-medium text-sm ${fontClass}`}>
                      {getTaskTitle(task)}
                    </div>
                    <div className="flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      {task.assignedTo && (
                        <span className={`text-xs text-muted-foreground ${fontClass}`}>
                          {task.assignedTo.name?.split(' ')[0] || task.assignedTo.email.split('@')[0]}
                        </span>
                      )}
                    </div>
                    {task.dueDate && (
                      <div className={`text-xs text-muted-foreground ${fontClass}`}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(task.id, "COMPLETED")
                        }}
                        className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        Complete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(task.id, "BLOCKED")
                        }}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Block
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <CardTitle className={`text-sm ${fontClass}`}>Completed</CardTitle>
              <Badge variant="outline">{groupedTasks.COMPLETED.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedTasks.COMPLETED.length === 0 ? (
              <p className={`text-sm text-muted-foreground ${fontClass}`}>No tasks</p>
            ) : (
              groupedTasks.COMPLETED.map((task) => (
                <Card key={task.id} className="p-3 border-green-200 bg-green-50 group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
                  <div className="space-y-2">
                    <div className={`font-medium text-sm ${fontClass} line-through text-muted-foreground`}>
                      {getTaskTitle(task)}
                    </div>
                    <div className="flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      {task.assignedTo && (
                        <span className={`text-xs text-muted-foreground ${fontClass}`}>
                          {task.assignedTo.name?.split(' ')[0] || task.assignedTo.email.split('@')[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(task.id, "TODO")
                        }}
                        className="h-7 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        Reopen
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Blocked Column */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <CardTitle className={`text-sm ${fontClass}`}>Blocked</CardTitle>
              <Badge variant="outline">{groupedTasks.BLOCKED.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupedTasks.BLOCKED.length === 0 ? (
              <p className={`text-sm text-muted-foreground ${fontClass}`}>No tasks</p>
            ) : (
              groupedTasks.BLOCKED.map((task) => (
                <Card key={task.id} className="p-3 border-red-200 bg-red-50 group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTaskClick(task)}>
                  <div className="space-y-2">
                    <div className={`font-medium text-sm ${fontClass}`}>
                      {getTaskTitle(task)}
                    </div>
                    <div className="flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      {task.assignedTo && (
                        <span className={`text-xs text-muted-foreground ${fontClass}`}>
                          {task.assignedTo.name?.split(' ')[0] || task.assignedTo.email.split('@')[0]}
                        </span>
                      )}
                    </div>
                    {task.dueDate && (
                      <div className={`text-xs text-muted-foreground ${fontClass}`}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(task.id, "TODO")
                        }}
                        className="h-7 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        Unblock
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTask(task.id)
                        }}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className={`bg-white max-w-3xl ${fontClass} max-h-[90vh] overflow-y-auto`}>
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className={fontClass}>Task Details</DialogTitle>
                <DialogDescription className={fontClass}>
                  View task information across all languages
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status and Priority */}
                <div className="flex items-center space-x-4">
                  {getStatusBadge(selectedTask.status)}
                  {getPriorityBadge(selectedTask.priority)}
                  {selectedTask.dueDate && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className={fontClass}>Due: {formatDate(selectedTask.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Assigned To */}
                {selectedTask.assignedTo && (
                  <div className="space-y-2">
                    <Label className={fontClass}>Assigned To</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className={fontClass}>{selectedTask.assignedTo.name || selectedTask.assignedTo.email}</span>
                    </div>
                  </div>
                )}

                {/* Titles (all languages) */}
                <div className="space-y-2">
                  <Label className={fontClass}>Titles</Label>
                  <div className="space-y-2 border rounded-none p-4 bg-gray-50">
                    {selectedTask.titleEn && (
                      <div>
                        <div className={`text-xs text-muted-foreground ${fontClass}`}>English</div>
                        <div className={`font-medium ${fontClass}`}>{selectedTask.titleEn}</div>
                      </div>
                    )}
                    {selectedTask.titleSv && (
                      <div className="pt-2 border-t">
                        <div className={`text-xs text-muted-foreground ${fontClass}`}>Svenska</div>
                        <div className={`font-medium ${fontClass}`}>{selectedTask.titleSv}</div>
                      </div>
                    )}
                    {selectedTask.titleKm && (
                      <div className="pt-2 border-t">
                        <div className={`text-xs text-muted-foreground ${fontClass}`}>ខ្មែរ</div>
                        <div className="font-medium font-khmer">{selectedTask.titleKm}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descriptions (all languages) */}
                {(selectedTask.descriptionEn || selectedTask.descriptionSv || selectedTask.descriptionKm) && (
                  <div className="space-y-2">
                    <Label className={fontClass}>Descriptions</Label>
                    <div className="space-y-2 border rounded-none p-4 bg-gray-50">
                      {selectedTask.descriptionEn && (
                        <div>
                          <div className={`text-xs text-muted-foreground ${fontClass}`}>English</div>
                          <div className={`text-sm whitespace-pre-wrap ${fontClass}`}>{selectedTask.descriptionEn}</div>
                        </div>
                      )}
                      {selectedTask.descriptionSv && (
                        <div className="pt-2 border-t">
                          <div className={`text-xs text-muted-foreground ${fontClass}`}>Svenska</div>
                          <div className={`text-sm whitespace-pre-wrap ${fontClass}`}>{selectedTask.descriptionSv}</div>
                        </div>
                      )}
                      {selectedTask.descriptionKm && (
                        <div className="pt-2 border-t">
                          <div className={`text-xs text-muted-foreground ${fontClass}`}>ខ្មែរ</div>
                          <div className="text-sm whitespace-pre-wrap font-khmer">{selectedTask.descriptionKm}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setIsDetailDialogOpen(false)}
                  className={fontClass}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Users, Calendar, Crown, Loader2, AlertCircle, CheckCircle2, Clock, XCircle, MoreVertical, ArrowRight, Plus, UserPlus, UserMinus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Initiative {
  id: string
  slug: string
  status: string
  category: string
  startDate: string | null
  endDate: string | null
  featuredImage: string | null
  translation: {
    title: string
    shortDescription: string
    description: string
  }
  projectLead: {
    id: string
    name: string | null
    profileImage: string | null
  }
  members: Array<{
    id: string
    role: string
    joinedAt: string
    contributionNote: string | null
    user: {
      id: string
      name: string | null
      email: string
      profileImage: string | null
    }
  }>
  tasks: Array<{
    id: string
    titleEn: string | null
    titleSv: string | null
    titleKm: string | null
    descriptionEn: string | null
    descriptionSv: string | null
    descriptionKm: string | null
    status: string
    priority: string
    dueDate: string | null
    completedAt: string | null
    order: number
    assignedTo: {
      id: string
      name: string | null
      email: string
      profileImage: string | null
    } | null
  }>
  myRole: string
  _count: {
    members: number
    tasks: number
  }
}

interface TaskCardProps {
  task: Initiative['tasks'][0]
  locale: string
  fontClass: string
  onStatusChange?: (taskId: string, newStatus: string) => void
  onToggleAssignment?: (taskId: string) => void
  currentUserId?: string
}

function SortableTaskCard({ task, locale, fontClass, onStatusChange, onToggleAssignment, currentUserId }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const getTaskTitle = () => {
    if (locale === 'sv' && task.titleSv) return task.titleSv
    if (locale === 'km' && task.titleKm) return task.titleKm
    return task.titleEn || task.titleSv || task.titleKm || 'Untitled Task'
  }

  const getPriorityBadge = () => {
    const priorities = {
      URGENT: <Badge className="bg-red-500 rounded-none">Urgent</Badge>,
      HIGH: <Badge className="bg-orange-500 rounded-none">High</Badge>,
      MEDIUM: <Badge className="bg-blue-500 rounded-none">Medium</Badge>,
      LOW: <Badge variant="outline" className="rounded-none">Low</Badge>,
    }
    return priorities[task.priority as keyof typeof priorities] || null
  }

  const statusOptions = [
    { value: 'TODO', label: locale === 'sv' ? 'Att Göra' : locale === 'km' ? 'ត្រូវធ្វើ' : 'To Do', icon: Clock },
    { value: 'IN_PROGRESS', label: locale === 'sv' ? 'Pågående' : locale === 'km' ? 'កំពុងដំណើរការ' : 'In Progress', icon: Loader2 },
    { value: 'COMPLETED', label: locale === 'sv' ? 'Slutförd' : locale === 'km' ? 'បានបញ្ចប់' : 'Completed', icon: CheckCircle2 },
    { value: 'BLOCKED', label: locale === 'sv' ? 'Blockerad' : locale === 'km' ? 'បានរារាំង' : 'Blocked', icon: XCircle },
  ]

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drop indicator - always shows at top (insert before) */}
      {isOver && (
        <div className="absolute -top-2 left-0 right-0 h-1 bg-[var(--sahakum-gold)] rounded-full z-10 shadow-lg">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[var(--sahakum-gold)] rounded-full"></div>
        </div>
      )}

      <Card className={`border-2 rounded-none mb-3 bg-white shadow-sm hover:shadow-lg transition-all ${
        isOver
          ? 'border-[var(--sahakum-gold)] border-dashed mt-8'
          : 'border-[var(--sahakum-navy)]/20 hover:border-[var(--sahakum-navy)]/40'
      }`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className={`font-medium ${fontClass} flex-1`} {...attributes} {...listeners} style={{ cursor: 'move' }}>
                {getTaskTitle()}
              </div>

              {/* Status Change Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="group h-8 w-8 p-0 flex items-center justify-center rounded-sm hover:bg-[var(--sahakum-gold)]/20 transition-colors border border-transparent hover:border-[var(--sahakum-gold)]/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-[var(--sahakum-navy)]/60 group-hover:text-[var(--sahakum-navy)] transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-[var(--sahakum-navy)]/20 rounded-none">
                  <div className={`px-2 py-1.5 text-xs font-semibold text-muted-foreground ${fontClass}`}>
                    {locale === 'sv' ? 'Flytta till' : locale === 'km' ? 'ផ្លាស់ទីទៅ' : 'Move to'}
                  </div>
                  <DropdownMenuSeparator />
                  {statusOptions
                    .filter(option => option.value !== task.status)
                    .map((option) => {
                      const Icon = option.icon
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange?.(task.id, option.value)
                          }}
                          className={`cursor-pointer ${fontClass} hover:bg-[var(--sahakum-gold)]/10`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          <span>{option.label}</span>
                          <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                        </DropdownMenuItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center justify-between">
              {getPriorityBadge()}
              {task.dueDate && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              {task.assignedTo ? (
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignedTo.profileImage || undefined} />
                    <AvatarFallback className="text-xs">
                      {task.assignedTo.name?.charAt(0) || task.assignedTo.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground text-xs">
                    {task.assignedTo.name || task.assignedTo.email}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  {locale === 'sv' ? 'Ej tilldelad' : locale === 'km' ? 'មិនទាន់ផ្តល់' : 'Unassigned'}
                </span>
              )}

              {onToggleAssignment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-[var(--sahakum-gold)]/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleAssignment(task.id)
                  }}
                >
                  {task.assignedTo?.id === currentUserId ? (
                    <>
                      <UserMinus className="h-3 w-3 mr-1" />
                      {locale === 'sv' ? 'Ta bort mig' : locale === 'km' ? 'ដកខ្ញុំចេញ' : 'Unassign me'}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      {locale === 'sv' ? 'Tilldela mig' : locale === 'km' ? 'ផ្តល់ឱ្យខ្ញុំ' : 'Assign me'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TaskCard({ task, locale, fontClass }: TaskCardProps) {
  const getTaskTitle = () => {
    if (locale === 'sv' && task.titleSv) return task.titleSv
    if (locale === 'km' && task.titleKm) return task.titleKm
    return task.titleEn || task.titleSv || task.titleKm || 'Untitled Task'
  }

  const getPriorityBadge = () => {
    const priorities = {
      URGENT: <Badge className="bg-red-500 rounded-none">Urgent</Badge>,
      HIGH: <Badge className="bg-orange-500 rounded-none">High</Badge>,
      MEDIUM: <Badge className="bg-blue-500 rounded-none">Medium</Badge>,
      LOW: <Badge variant="outline" className="rounded-none">Low</Badge>,
    }
    return priorities[task.priority as keyof typeof priorities] || null
  }

  return (
    <Card className="border-2 border-[var(--sahakum-navy)]/20 rounded-none mb-3 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className={`font-medium ${fontClass}`}>
            {getTaskTitle()}
          </div>

          <div className="flex items-center justify-between">
            {getPriorityBadge()}
            {task.dueDate && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>

          {task.assignedTo && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignedTo.profileImage || undefined} />
                <AvatarFallback className="text-xs">
                  {task.assignedTo.name?.charAt(0) || task.assignedTo.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground text-xs">
                {task.assignedTo.name || task.assignedTo.email}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface DroppableColumnProps {
  id: string
  title: string
  icon: React.ReactNode
  tasks: Initiative['tasks']
  locale: string
  fontClass: string
  bgColor: string
  borderColor: string
  isTargeted: boolean
  onStatusChange: (taskId: string, newStatus: string) => void
  onCreateTask: (status: string) => void
  onToggleAssignment: (taskId: string) => void
  currentUserId: string
  overId: string | null
}

function DroppableColumn({ id, title, icon, tasks, locale, fontClass, bgColor, borderColor, isTargeted, onStatusChange, onCreateTask, onToggleAssignment, currentUserId, overId }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  // Check if hovering over the last task in this column
  const lastTaskId = tasks.length > 0 ? tasks[tasks.length - 1].id : null
  const isHoveringLastTask = lastTaskId && overId === lastTaskId

  return (
    <div className={`flex flex-col h-full transition-all duration-200 ${
      isTargeted ? 'scale-[1.02] z-10' : ''
    }`}>
      <div className={`mb-4 flex items-center gap-2 transition-all duration-200 ${
        isTargeted ? 'text-[var(--sahakum-gold)]' : ''
      }`}>
        {icon}
        <h3 className={`font-semibold ${fontClass} flex-1 ${
          isTargeted ? 'text-[var(--sahakum-gold)]' : 'text-[var(--sahakum-navy)]'
        }`}>
          {title}
        </h3>
        <Badge variant="outline" className={`rounded-none ${isTargeted ? 'border-[var(--sahakum-gold)] text-[var(--sahakum-gold)]' : ''}`}>
          {tasks.length}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-[var(--sahakum-gold)]/20"
          onClick={() => onCreateTask(id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-4 border-2 rounded-lg transition-all duration-200 relative ${
          isTargeted
            ? 'bg-[var(--sahakum-gold)]/20 border-[var(--sahakum-gold)] border-solid border-4 shadow-2xl'
            : `bg-white border-dashed ${borderColor}`
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              locale={locale}
              fontClass={fontClass}
              onStatusChange={onStatusChange}
              onToggleAssignment={onToggleAssignment}
              currentUserId={currentUserId}
              isLastInColumn={index === tasks.length - 1}
            />
          ))}
        </SortableContext>

        {/* Drop indicator for end of list - shows when hovering empty space OR last task */}
        {(isOver || isHoveringLastTask) && tasks.length > 0 && (
          <div className="mt-3 h-1 bg-[var(--sahakum-gold)] rounded-full shadow-lg">
            <div className="relative -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[var(--sahakum-gold)] rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InitiativeDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const locale = params.locale as string
  const { data: session } = useSession()
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const [initiative, setInitiative] = useState<Initiative | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [overId, setOverId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createTaskStatus, setCreateTaskStatus] = useState<string>('TODO')
  const [newTask, setNewTask] = useState({
    titleEn: '',
    titleSv: '',
    titleKm: '',
    descriptionEn: '',
    priority: 'MEDIUM',
    dueDate: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchInitiative()
  }, [slug, locale])

  const fetchInitiative = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/my/initiatives/${slug}?language=${locale}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch initiative')
      }

      const data = await response.json()
      setInitiative(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string || null)
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!initiative) return

    const task = initiative.tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    try {
      setUpdating(true)

      const response = await fetch(`/api/initiatives/${initiative.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      // Optimistically update the UI
      setInitiative(prev => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: prev.tasks.map(t =>
            t.id === taskId
              ? { ...t, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null }
              : t
          )
        }
      })
    } catch (err) {
      console.error('Error updating task:', err)
      // Revert on error by refetching
      fetchInitiative()
    } finally {
      setUpdating(false)
    }
  }

  const createTask = async () => {
    if (!initiative || !newTask.titleEn.trim()) return

    try {
      setUpdating(true)

      const response = await fetch(`/api/initiatives/${initiative.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          status: createTaskStatus,
          dueDate: newTask.dueDate || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const data = await response.json()
      const createdTask = data.task || data

      // Add to UI
      setInitiative(prev => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: [...prev.tasks, createdTask],
          _count: {
            ...prev._count,
            tasks: prev._count.tasks + 1,
          },
        }
      })

      // Reset form and close dialog
      setNewTask({
        titleEn: '',
        titleSv: '',
        titleKm: '',
        descriptionEn: '',
        priority: 'MEDIUM',
        dueDate: '',
      })
      setCreateDialogOpen(false)
    } catch (err) {
      console.error('Error creating task:', err)
      fetchInitiative()
    } finally {
      setUpdating(false)
    }
  }

  const toggleTaskAssignment = async (taskId: string) => {
    if (!initiative || !session?.user) return

    const task = initiative.tasks.find(t => t.id === taskId)
    if (!task) return

    const isAssignedToMe = task.assignedTo?.id === session.user.id
    const newAssigneeId = isAssignedToMe ? null : session.user.id

    try {
      setUpdating(true)

      const response = await fetch(`/api/initiatives/${initiative.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: newAssigneeId }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task assignment')
      }

      // Optimistically update the UI
      setInitiative(prev => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: prev.tasks.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  assignedTo: isAssignedToMe ? null : {
                    id: session.user.id,
                    name: session.user.name || null,
                    email: session.user.email || '',
                    profileImage: session.user.profileImage || null,
                  }
                }
              : t
          )
        }
      })
    } catch (err) {
      console.error('Error updating task assignment:', err)
      fetchInitiative()
    } finally {
      setUpdating(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over || !initiative) return

    const taskId = active.id as string
    const overId = over.id as string

    // If dropping on itself, do nothing
    if (taskId === overId) return

    // Check if we're dropping over a column or another task
    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']
    let newStatus = overId
    let overTask = null

    // If dropping over a task, get the task's status (the column it's in)
    if (!validStatuses.includes(overId)) {
      overTask = initiative.tasks.find(t => t.id === overId)
      if (overTask) {
        newStatus = overTask.status
      } else {
        return // Invalid drop target
      }
    }

    const task = initiative.tasks.find(t => t.id === taskId)
    if (!task) return

    // Check if status changed or if reordering within same column
    const statusChanged = task.status !== newStatus
    const sameColumn = task.status === newStatus

    // Calculate new order
    let newOrder = task.order

    // Build new task order array
    let newTaskOrder: string[] = []

    if (sameColumn) {
      // Reordering within the same column
      // Get original positions to detect direction
      const allColumnTasks = initiative.tasks
        .filter(t => t.status === newStatus)
        .sort((a, b) => a.order - b.order)

      const draggedIndex = allColumnTasks.findIndex(t => t.id === taskId)
      const overIndex = allColumnTasks.findIndex(t => t.id === overId)

      // Remove the dragged task
      const columnTasks = allColumnTasks.filter(t => t.id !== taskId)

      if (overTask) {
        const movingDown = draggedIndex < overIndex

        if (movingDown) {
          // Moving DOWN: insert AFTER the hovered task
          columnTasks.forEach(t => {
            newTaskOrder.push(t.id)
            if (t.id === overId) {
              newTaskOrder.push(taskId) // Insert dragged task after
            }
          })
        } else {
          // Moving UP: insert BEFORE the hovered task
          columnTasks.forEach(t => {
            if (t.id === overId) {
              newTaskOrder.push(taskId) // Insert dragged task before
            }
            newTaskOrder.push(t.id)
          })
        }
      } else {
        // Insert at the end
        columnTasks.forEach(t => newTaskOrder.push(t.id))
        newTaskOrder.push(taskId)
      }
    } else {
      // Moving to a different column
      const targetColumnTasks = initiative.tasks
        .filter(t => t.status === newStatus)
        .sort((a, b) => a.order - b.order)

      if (overTask) {
        // Insert before the hovered task
        targetColumnTasks.forEach(t => {
          if (t.id === overId) {
            newTaskOrder.push(taskId)
          }
          newTaskOrder.push(t.id)
        })
      } else {
        // Insert at the end
        targetColumnTasks.forEach(t => newTaskOrder.push(t.id))
        newTaskOrder.push(taskId)
      }
    }

    // Create a map of task ID to new order number
    const orderMap = new Map<string, number>()
    newTaskOrder.forEach((id, index) => {
      orderMap.set(id, index * 100)
    })

    const newDraggedTaskOrder = orderMap.get(taskId) || 0

    // Only update if something actually changed
    if (!statusChanged && newDraggedTaskOrder === task.order) return

    // Optimistically update UI IMMEDIATELY - update ALL tasks in the column with new orders
    setInitiative(prev => {
      if (!prev) return prev
      return {
        ...prev,
        tasks: prev.tasks.map(t => {
          if (t.id === taskId) {
            // Update the dragged task
            return {
              ...t,
              status: newStatus,
              order: newDraggedTaskOrder,
              completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null
            }
          } else if (orderMap.has(t.id)) {
            // Update other tasks in the same column with new order
            return {
              ...t,
              order: orderMap.get(t.id)!
            }
          }
          return t
        })
      }
    })

    // Then update via API in background
    try {
      setUpdating(true)

      const updateData: any = {}
      if (statusChanged) {
        updateData.status = newStatus
      }
      updateData.order = newDraggedTaskOrder

      const response = await fetch(`/api/initiatives/${initiative.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      // Also update all other tasks in the column with their new orders
      // This ensures the database stays in sync
      const otherTaskUpdates = Array.from(orderMap.entries())
        .filter(([id]) => id !== taskId && initiative.tasks.find(t => t.id === id)?.status === newStatus)
        .map(async ([id, order]) => {
          try {
            await fetch(`/api/initiatives/${initiative.id}/tasks/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order }),
            })
          } catch (e) {
            console.error(`Failed to update order for task ${id}:`, e)
          }
        })

      // Fire and forget - don't wait for these
      Promise.all(otherTaskUpdates).catch(() => {})

    } catch (err) {
      console.error('Error updating task:', err)
      // Revert on error by refetching
      fetchInitiative()
    } finally {
      setUpdating(false)
    }
  }

  const texts = {
    overview: {
      en: 'Overview',
      sv: 'Översikt',
      km: 'ទិដ្ឋភាពទូទៅ'
    },
    tasks: {
      en: 'Tasks',
      sv: 'Uppgifter',
      km: 'កិច្ចការ'
    },
    team: {
      en: 'Team',
      sv: 'Team',
      km: 'ក្រុម'
    },
    updates: {
      en: 'Updates',
      sv: 'Uppdateringar',
      km: 'ការធ្វើបច្ចុប្បន្នភាព'
    },
    members: {
      en: 'members',
      sv: 'medlemmar',
      km: 'សមាជិក'
    },
    yourRole: {
      en: 'Your Role',
      sv: 'Din Roll',
      km: 'តួនាទីរបស់អ្នក'
    },
    projectLead: {
      en: 'Project Lead',
      sv: 'Projektledare',
      km: 'ប្រធានគម្រោង'
    },
    todo: {
      en: 'To Do',
      sv: 'Att Göra',
      km: 'ត្រូវធ្វើ'
    },
    inProgress: {
      en: 'In Progress',
      sv: 'Pågående',
      km: 'កំពុងដំណើរការ'
    },
    completed: {
      en: 'Completed',
      sv: 'Slutförd',
      km: 'បានបញ្ចប់'
    },
    blocked: {
      en: 'Blocked',
      sv: 'Blockerad',
      km: 'បានរារាំង'
    },
    lead: {
      en: 'Lead',
      sv: 'Ledare',
      km: 'ប្រធាន'
    },
    coLead: {
      en: 'Co-Lead',
      sv: 'Medledare',
      km: 'អនុប្រធាន'
    },
    member: {
      en: 'Member',
      sv: 'Medlem',
      km: 'សមាជិក'
    },
    joined: {
      en: 'Joined',
      sv: 'Gick med',
      km: 'បានចូលរួម'
    }
  }

  const t = (key: keyof typeof texts) => texts[key][locale as keyof typeof texts.overview] || texts[key].en

  const getRoleLabel = (role: string) => {
    if (role === 'LEAD') return t('lead')
    if (role === 'CO_LEAD') return t('coLead')
    return t('member')
  }

  const getRoleBadge = (role: string) => {
    if (role === 'LEAD') {
      return <Badge className="bg-purple-500 rounded-none"><Crown className="h-3 w-3 mr-1" />{getRoleLabel(role)}</Badge>
    }
    if (role === 'CO_LEAD') {
      return <Badge className="bg-blue-500 rounded-none">{getRoleLabel(role)}</Badge>
    }
    return <Badge variant="outline" className="rounded-none">{getRoleLabel(role)}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sahakum-gold)]" />
      </div>
    )
  }

  if (error || !initiative) {
    return (
      <Card className="border border-gray-200 rounded-none">
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p className={fontClass}>{error || 'Initiative not found'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const tasksByStatus = {
    TODO: initiative.tasks.filter(t => t.status === 'TODO').sort((a, b) => a.order - b.order),
    IN_PROGRESS: initiative.tasks.filter(t => t.status === 'IN_PROGRESS').sort((a, b) => a.order - b.order),
    COMPLETED: initiative.tasks.filter(t => t.status === 'COMPLETED').sort((a, b) => a.order - b.order),
    BLOCKED: initiative.tasks.filter(t => t.status === 'BLOCKED').sort((a, b) => a.order - b.order),
  }

  const activeTask = activeId ? initiative.tasks.find(t => t.id === activeId) : null

  // Determine which column is being targeted
  const getTargetedColumn = () => {
    if (!overId) return null

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']
    if (validStatuses.includes(overId)) {
      return overId
    }

    // If hovering over a task, find which column it belongs to
    const overTask = initiative.tasks.find(t => t.id === overId)
    return overTask?.status || null
  }

  const targetedColumn = getTargetedColumn()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {initiative.featuredImage && (
          <div className="h-64 bg-gray-200 mb-6 overflow-hidden">
            <img
              src={initiative.featuredImage}
              alt={initiative.translation.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className={`text-3xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
              {initiative.translation.title}
            </h1>
            {initiative.translation.shortDescription && (
              <p className={`mt-2 text-lg text-muted-foreground ${fontClass}`}>
                {initiative.translation.shortDescription}
              </p>
            )}
          </div>
          {getRoleBadge(initiative.myRole)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200 rounded-none">
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${fontClass}`}>
              {t('projectLead')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={initiative.projectLead.profileImage || undefined} />
                <AvatarFallback>
                  {initiative.projectLead.name?.charAt(0) || 'L'}
                </AvatarFallback>
              </Avatar>
              <span className={fontClass}>{initiative.projectLead.name || 'Project Lead'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-none">
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${fontClass}`}>
              {t('yourRole')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--sahakum-navy)]">
              {getRoleLabel(initiative.myRole)}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-none">
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${fontClass}`}>
              <Users className="h-4 w-4 inline mr-1" />
              {t('members')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--sahakum-navy)]">
              {initiative._count.members}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg h-auto">
          <TabsTrigger value="overview" className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2`}>
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="tasks" className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2`}>
            {t('tasks')}
          </TabsTrigger>
          <TabsTrigger value="team" className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2`}>
            {t('team')}
          </TabsTrigger>
          <TabsTrigger value="updates" className={`${fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2`}>
            {t('updates')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card className="border border-gray-200 rounded-none">
            <CardHeader>
              <CardTitle className={fontClass}>About This Initiative</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`prose max-w-none ${fontClass}`}
                dangerouslySetInnerHTML={{ __html: initiative.translation.description || 'No description provided.' }}
              />

              {(initiative.startDate || initiative.endDate) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid gap-4 md:grid-cols-2">
                    {initiative.startDate && (
                      <div>
                        <div className={`text-sm font-medium text-muted-foreground ${fontClass}`}>Start Date</div>
                        <div className={`text-lg font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
                          {new Date(initiative.startDate).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    {initiative.endDate && (
                      <div>
                        <div className={`text-sm font-medium text-muted-foreground ${fontClass}`}>End Date</div>
                        <div className={`text-lg font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
                          {new Date(initiative.endDate).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab - Drag and Drop Kanban */}
        <TabsContent value="tasks" className="mt-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid gap-4 md:grid-cols-4 auto-rows-fr">
              <DroppableColumn
                id="TODO"
                title={t('todo')}
                icon={<Clock className="h-5 w-5 text-gray-500" />}
                tasks={tasksByStatus.TODO}
                locale={locale}
                fontClass={fontClass}
                bgColor=""
                borderColor="border-gray-400"
                isTargeted={targetedColumn === 'TODO'}
                onStatusChange={updateTaskStatus}
                onCreateTask={(status) => {
                  setCreateTaskStatus(status)
                  setCreateDialogOpen(true)
                }}
                onToggleAssignment={toggleTaskAssignment}
                currentUserId={session?.user?.id || ''}
                overId={overId}
              />

              <DroppableColumn
                id="IN_PROGRESS"
                title={t('inProgress')}
                icon={<Loader2 className="h-5 w-5 text-blue-500" />}
                tasks={tasksByStatus.IN_PROGRESS}
                locale={locale}
                fontClass={fontClass}
                bgColor=""
                borderColor="border-gray-400"
                isTargeted={targetedColumn === 'IN_PROGRESS'}
                onStatusChange={updateTaskStatus}
                onCreateTask={(status) => {
                  setCreateTaskStatus(status)
                  setCreateDialogOpen(true)
                }}
                onToggleAssignment={toggleTaskAssignment}
                currentUserId={session?.user?.id || ''}
                overId={overId}
              />

              <DroppableColumn
                id="COMPLETED"
                title={t('completed')}
                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                tasks={tasksByStatus.COMPLETED}
                locale={locale}
                fontClass={fontClass}
                bgColor=""
                borderColor="border-gray-400"
                isTargeted={targetedColumn === 'COMPLETED'}
                onStatusChange={updateTaskStatus}
                onCreateTask={(status) => {
                  setCreateTaskStatus(status)
                  setCreateDialogOpen(true)
                }}
                onToggleAssignment={toggleTaskAssignment}
                currentUserId={session?.user?.id || ''}
                overId={overId}
              />

              <DroppableColumn
                id="BLOCKED"
                title={t('blocked')}
                icon={<XCircle className="h-5 w-5 text-red-500" />}
                tasks={tasksByStatus.BLOCKED}
                locale={locale}
                fontClass={fontClass}
                bgColor=""
                borderColor="border-gray-400"
                isTargeted={targetedColumn === 'BLOCKED'}
                onStatusChange={updateTaskStatus}
                onCreateTask={(status) => {
                  setCreateTaskStatus(status)
                  setCreateDialogOpen(true)
                }}
                onToggleAssignment={toggleTaskAssignment}
                currentUserId={session?.user?.id || ''}
                overId={overId}
              />
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="transform rotate-2 scale-105">
                  <Card className="border-3 border-[var(--sahakum-gold)] rounded-none bg-white shadow-2xl">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className={`font-medium ${fontClass}`}>
                          {activeTask.titleEn || activeTask.titleSv || activeTask.titleKm || 'Untitled Task'}
                        </div>
                        {activeTask.assignedTo && (
                          <div className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={activeTask.assignedTo.profileImage || undefined} />
                              <AvatarFallback className="text-xs">
                                {activeTask.assignedTo.name?.charAt(0) || activeTask.assignedTo.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground text-xs">
                              {activeTask.assignedTo.name || activeTask.assignedTo.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {updating && (
            <div className="fixed bottom-4 right-4 bg-[var(--sahakum-navy)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className={fontClass}>Updating task...</span>
            </div>
          )}

          {/* Create Task Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white border-2 border-[var(--sahakum-navy)]/20 rounded-none">
              <DialogHeader>
                <DialogTitle className={`text-[var(--sahakum-navy)] ${fontClass}`}>
                  {locale === 'sv' ? 'Skapa ny uppgift' : locale === 'km' ? 'បង្កើតកិច្ចការថ្មី' : 'Create New Task'}
                </DialogTitle>
                <DialogDescription className={fontClass}>
                  {locale === 'sv' ? 'Lägg till en ny uppgift i denna initiativ' : locale === 'km' ? 'បន្ថែមកិច្ចការថ្មីទៅគម្រោងនេះ' : 'Add a new task to this initiative'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* English Title (Required) */}
                <div className="grid gap-2">
                  <Label htmlFor="titleEn" className={fontClass}>
                    Title (English) *
                  </Label>
                  <Input
                    id="titleEn"
                    value={newTask.titleEn}
                    onChange={(e) => setNewTask({ ...newTask, titleEn: e.target.value })}
                    placeholder="Enter task title..."
                    className="border-[var(--sahakum-navy)]/20 rounded-none font-sweden"
                  />
                </div>

                {/* Swedish Title (Optional) */}
                <div className="grid gap-2">
                  <Label htmlFor="titleSv" className={fontClass}>
                    Title (Swedish)
                  </Label>
                  <Input
                    id="titleSv"
                    value={newTask.titleSv}
                    onChange={(e) => setNewTask({ ...newTask, titleSv: e.target.value })}
                    placeholder="Ange uppgiftstitel..."
                    className="border-[var(--sahakum-navy)]/20 rounded-none font-sweden"
                  />
                </div>

                {/* Khmer Title (Optional) */}
                <div className="grid gap-2">
                  <Label htmlFor="titleKm" className={fontClass}>
                    Title (Khmer)
                  </Label>
                  <Input
                    id="titleKm"
                    value={newTask.titleKm}
                    onChange={(e) => setNewTask({ ...newTask, titleKm: e.target.value })}
                    placeholder="បញ្ចូលចំណងជើងកិច្ចការ..."
                    className="border-[var(--sahakum-navy)]/20 rounded-none font-khmer"
                  />
                </div>

                {/* Description */}
                <div className="grid gap-2">
                  <Label htmlFor="descriptionEn" className={fontClass}>
                    Description
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={newTask.descriptionEn}
                    onChange={(e) => setNewTask({ ...newTask, descriptionEn: e.target.value })}
                    placeholder="Add task description..."
                    className="border-[var(--sahakum-navy)]/20 rounded-none font-sweden"
                    rows={3}
                  />
                </div>

                {/* Priority and Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority" className={fontClass}>
                      Priority
                    </Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger className="border-[var(--sahakum-navy)]/20 rounded-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[var(--sahakum-navy)]/20 rounded-none">
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dueDate" className={fontClass}>
                      Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="border-[var(--sahakum-navy)]/20 rounded-none"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-[var(--sahakum-navy)]/20 rounded-none"
                >
                  {locale === 'sv' ? 'Avbryt' : locale === 'km' ? 'បោះបង់' : 'Cancel'}
                </Button>
                <Button
                  onClick={createTask}
                  disabled={!newTask.titleEn.trim() || updating}
                  className="bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-gold)]/90 rounded-none"
                >
                  {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {locale === 'sv' ? 'Skapa uppgift' : locale === 'km' ? 'បង្កើតកិច្ចការ' : 'Create Task'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <Card className="border border-gray-200 rounded-none">
            <CardHeader>
              <CardTitle className={fontClass}>Team Members</CardTitle>
              <CardDescription className={fontClass}>
                {initiative._count.members} {t('members')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {initiative.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.profileImage || undefined} />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-medium ${fontClass}`}>
                          {member.user.name || member.user.email}
                        </div>
                        <div className={`text-sm text-muted-foreground ${fontClass}`}>
                          {t('joined')} {new Date(member.joinedAt).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        {member.contributionNote && (
                          <div className={`text-sm text-muted-foreground italic mt-1 ${fontClass}`}>
                            {member.contributionNote}
                          </div>
                        )}
                      </div>
                    </div>
                    {getRoleBadge(member.role)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updates Tab */}
        <TabsContent value="updates" className="mt-6">
          <Card className="border border-gray-200 rounded-none">
            <CardHeader>
              <CardTitle className={fontClass}>Initiative Updates</CardTitle>
              <CardDescription className={fontClass}>
                Activity and announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-center py-12 text-muted-foreground ${fontClass}`}>
                No updates yet. This feature is coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

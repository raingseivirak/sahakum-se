'use client'

import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Settings,
  Building2,
  Globe,
  Mail,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  Shield,
  Check,
  X,
  Settings2,
  Info,
} from "lucide-react"
import Link from "next/link"

interface Setting {
  id: string
  key: string
  value: string | null
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'URL' | 'EMAIL' | 'IMAGE'
  category: string
  createdAt: string
  updatedAt: string
}

interface SettingsPageProps {
  params: { locale: string }
}

// Define the settings structure
const SETTINGS_SCHEMA = {
  organization: {
    title: 'Organization',
    icon: Building2,
    fields: [
      { key: 'org_name', label: 'Organization Name', type: 'TEXT', placeholder: 'Sahakum Khmer' },
      { key: 'org_description', label: 'Description', type: 'TEXT', placeholder: 'Brief description of your organization' },
      { key: 'org_mission', label: 'Mission Statement', type: 'TEXT', placeholder: 'Your organization mission' },
      { key: 'org_vision', label: 'Vision Statement', type: 'TEXT', placeholder: 'Your organization vision' },
      { key: 'org_logo', label: 'Logo URL', type: 'IMAGE', placeholder: 'https://example.com/logo.png' },
    ]
  },
  contact: {
    title: 'Contact Information',
    icon: Mail,
    fields: [
      { key: 'contact_email', label: 'Contact Email', type: 'EMAIL', placeholder: 'contact@sahakumkhmer.se' },
      { key: 'contact_phone', label: 'Phone Number', type: 'TEXT', placeholder: '+46 123 456 789' },
      { key: 'contact_address', label: 'Address', type: 'TEXT', placeholder: 'Street Address, City, Country' },
      { key: 'office_hours', label: 'Office Hours', type: 'TEXT', placeholder: 'Mon-Fri 9:00-17:00' },
    ]
  },
  social: {
    title: 'Social Media',
    icon: Globe,
    fields: [
      { key: 'social_facebook', label: 'Facebook URL', type: 'URL', placeholder: 'https://facebook.com/sahakumkhmer' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'URL', placeholder: 'https://instagram.com/sahakumkhmer' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'URL', placeholder: 'https://youtube.com/@sahakumkhmer' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'URL', placeholder: 'https://linkedin.com/company/sahakumkhmer' },
    ]
  },
  permissions: {
    title: 'Permissions',
    icon: Shield,
    fields: [
      { key: 'permissions_author_edit_others', label: 'Authors Can Edit Others\' Content', type: 'BOOLEAN', placeholder: 'false' },
      { key: 'permissions_author_publish_direct', label: 'Authors Can Publish Directly', type: 'BOOLEAN', placeholder: 'false' },
      { key: 'permissions_moderator_edit_others', label: 'Moderators Can Edit Others\' Content', type: 'BOOLEAN', placeholder: 'true' },
      { key: 'permissions_moderator_publish_direct', label: 'Moderators Can Publish Directly', type: 'BOOLEAN', placeholder: 'false' },
      { key: 'content_workflow_enabled', label: 'Enable Content Workflow', type: 'BOOLEAN', placeholder: 'true' },
      { key: 'content_approval_required', label: 'Require Content Approval', type: 'BOOLEAN', placeholder: 'true' },
    ]
  },
  site: {
    title: 'Site Configuration',
    icon: Settings,
    fields: [
      { key: 'site_title', label: 'Site Title', type: 'TEXT', placeholder: 'Sahakum Khmer - Swedish-Cambodian Association' },
      { key: 'site_description', label: 'Site Description', type: 'TEXT', placeholder: 'Meta description for SEO' },
      { key: 'site_keywords', label: 'SEO Keywords', type: 'TEXT', placeholder: 'cambodian, swedish, association, community' },
      { key: 'default_language', label: 'Default Language', type: 'TEXT', placeholder: 'sv' },
    ]
  }
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const fontClass = 'font-sweden'
  const [settings, setSettings] = useState<Record<string, Setting[]>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')

      const data = await response.json()
      setSettings(data.settings || {})

      // Populate form data
      const formValues: Record<string, string> = {}
      Object.values(data.settings || {}).flat().forEach((setting: Setting) => {
        formValues[setting.key] = setting.value || ''
      })
      setFormData(formValues)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const settingsToUpdate = Object.entries(formData)
        .filter(([_, value]) => value.trim() !== '')
        .map(([key, value]) => {
          // Find the field schema to get the type and category
          let type = 'TEXT'
          let category = 'general'

          for (const [catKey, catConfig] of Object.entries(SETTINGS_SCHEMA)) {
            const field = catConfig.fields.find(f => f.key === key)
            if (field) {
              type = field.type
              category = catKey
              break
            }
          }

          return { key, value, type, category }
        })

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToUpdate })
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      await fetchSettings() // Refresh data
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className={`space-y-4 ${fontClass}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${fontClass}`}>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${params.locale}/admin`} className={fontClass}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
              Settings
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Configure your organization settings and site preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button
              className={`bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white ${fontClass}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription className={fontClass}>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="organization" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(SETTINGS_SCHEMA).map(([key, config]) => {
              const Icon = config.icon
              return (
                <TabsTrigger key={key} value={key} className={fontClass}>
                  <Icon className="mr-2 h-4 w-4" />
                  {config.title}
                </TabsTrigger>
              )
            })}
          </TabsList>

{Object.entries(SETTINGS_SCHEMA).map(([categoryKey, config]) => (
            <TabsContent key={categoryKey} value={categoryKey}>
              {categoryKey === 'permissions' ? (
                <div className="space-y-6">
                  {/* Permission Overview Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                        <Info className="h-5 w-5" />
                        Permission Overview
                      </CardTitle>
                      <CardDescription className={fontClass}>
                        Overview of what each role can do in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className={fontClass}>Permission</TableHead>
                            <TableHead className={`text-center ${fontClass}`}>USER</TableHead>
                            <TableHead className={`text-center ${fontClass}`}>AUTHOR</TableHead>
                            <TableHead className={`text-center ${fontClass}`}>MODERATOR</TableHead>
                            <TableHead className={`text-center ${fontClass}`}>EDITOR</TableHead>
                            <TableHead className={`text-center ${fontClass}`}>BOARD</TableHead>
                            <TableHead className={`text-center ${fontClass}`}>ADMIN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className={fontClass}>Manage Pages</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>Manage Blog Posts</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>View Categories/Tags</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>Create Categories/Tags</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>View Services</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" title="Any authenticated user" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" title="Any authenticated user" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" title="Any authenticated user" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" title="Any authenticated user" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" title="Any authenticated user" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>Manage Services</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>View Membership Requests</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>Manage Members</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>Approve Membership</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>View Settings</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className={fontClass}>Manage Users/Settings</TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><X className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                            <TableCell className="text-center"><Check className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className={fontClass}>Working</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          <span className={fontClass}>Not Allowed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className={fontClass}>Currently Broken</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-blue-500" />
                          <span className={fontClass}>Configurable Below</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Workflow Explanation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                        <Settings2 className="h-5 w-5" />
                        Content Workflow
                      </CardTitle>
                      <CardDescription className={fontClass}>
                        How content moves through the system based on user roles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className={`font-semibold ${fontClass}`}>Content Creation Workflow:</h4>
                          <div className="space-y-2 text-sm">
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span><strong>AUTHORS</strong> create blog posts and draft content</span>
                            </div>
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span><strong>EDITORS</strong> manage pages, categories, and content review</span>
                            </div>
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span><strong>BOARD</strong> approves membership requests and strategic content</span>
                            </div>
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span><strong>ADMINS</strong> have full system control and user management</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className={`font-semibold ${fontClass}`}>Content Publishing Flow:</h4>
                          <div className="space-y-2 text-sm">
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span><strong>DRAFT</strong>: Content created by authors, not visible publicly</span>
                            </div>
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span><strong>REVIEW</strong>: Editors review and modify content as needed</span>
                            </div>
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span><strong>PUBLISHED</strong>: Content goes live and is visible to public</span>
                            </div>
                            <div className={`flex items-center gap-2 ${fontClass}`}>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span><strong>ARCHIVED</strong>: Old content hidden but preserved</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className={`font-semibold text-blue-800 mb-2 ${fontClass}`}>Current Implementation Notes:</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                          <div className={`flex items-center gap-2 ${fontClass}`}>
                            <Check className="h-4 w-4 text-green-600" />
                            <span><strong>Working:</strong> Blog Posts (AUTHOR+), Membership Requests (BOARD+), Settings (EDITOR+)</span>
                          </div>
                          <div className={`flex items-center gap-2 ${fontClass}`}>
                            <Check className="h-4 w-4 text-green-600" />
                            <span><strong>Status-based publishing:</strong> DRAFT → PUBLISHED → ARCHIVED content states</span>
                          </div>
                          <div className={`flex items-center gap-2 ${fontClass}`}>
                            <Settings2 className="h-4 w-4 text-blue-600" />
                            <span><strong>Configurable:</strong> Permission settings below can modify role capabilities</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Permission Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                        <config.icon className="h-5 w-5" />
                        {config.title} Configuration
                      </CardTitle>
                      <CardDescription className={fontClass}>
                        Configure permission settings that affect role capabilities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {config.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label htmlFor={field.key} className={fontClass}>
                            {field.label}
                          </Label>
                          {field.type === 'BOOLEAN' ? (
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={field.key}
                                checked={formData[field.key] === 'true'}
                                onCheckedChange={(checked) => handleInputChange(field.key, checked.toString())}
                                className={fontClass}
                              />
                              <Label htmlFor={field.key} className={`text-sm text-muted-foreground ${fontClass}`}>
                                {formData[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                              </Label>
                            </div>
                          ) : field.type === 'TEXT' && field.key.includes('mission') || field.key.includes('vision') || field.key.includes('description') ? (
                            <Textarea
                              id={field.key}
                              placeholder={field.placeholder}
                              value={formData[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              className={fontClass}
                              rows={3}
                            />
                          ) : (
                            <Input
                              id={field.key}
                              type={field.type === 'EMAIL' ? 'email' : field.type === 'URL' ? 'url' : 'text'}
                              placeholder={field.placeholder}
                              value={formData[field.key] || ''}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              className={fontClass}
                            />
                          )}
                          {field.type === 'IMAGE' && formData[field.key] && (
                            <div className="mt-2">
                              <img
                                src={formData[field.key]}
                                alt="Preview"
                                className="h-20 w-20 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                      <config.icon className="h-5 w-5" />
                      {config.title}
                    </CardTitle>
                    <CardDescription className={fontClass}>
                      Configure {config.title.toLowerCase()} settings for your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {config.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key} className={fontClass}>
                          {field.label}
                        </Label>
                        {field.type === 'BOOLEAN' ? (
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={field.key}
                              checked={formData[field.key] === 'true'}
                              onCheckedChange={(checked) => handleInputChange(field.key, checked.toString())}
                              className={fontClass}
                            />
                            <Label htmlFor={field.key} className={`text-sm text-muted-foreground ${fontClass}`}>
                              {formData[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                            </Label>
                          </div>
                        ) : field.type === 'TEXT' && field.key.includes('mission') || field.key.includes('vision') || field.key.includes('description') ? (
                          <Textarea
                            id={field.key}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            className={fontClass}
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            type={field.type === 'EMAIL' ? 'email' : field.type === 'URL' ? 'url' : 'text'}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            className={fontClass}
                          />
                        )}
                        {field.type === 'IMAGE' && formData[field.key] && (
                          <div className="mt-2">
                            <img
                              src={formData[field.key]}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
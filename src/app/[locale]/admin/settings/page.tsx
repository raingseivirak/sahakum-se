'use client'

import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Building2,
  Globe,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ArrowLeft,
  Save,
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
          <TabsList className="grid w-full grid-cols-4">
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
                      {field.type === 'TEXT' && field.key.includes('mission') || field.key.includes('vision') || field.key.includes('description') ? (
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
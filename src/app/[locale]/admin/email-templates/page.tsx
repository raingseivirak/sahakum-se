"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Mail, Globe, Eye, ExternalLink } from "lucide-react"

export default function EmailTemplatesPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'sv' | 'km'>('en')
  const [selectedTemplate, setSelectedTemplate] = useState<'welcome' | 'approval' | 'board'>('welcome')

  const getPreviewUrl = () => {
    return `/api/email-templates/preview?template=${selectedTemplate}&language=${selectedLanguage}`
  }

  const templates = [
    {
      value: 'welcome',
      label: 'Welcome Email',
      description: 'Sent to applicants when they submit membership request'
    },
    {
      value: 'approval',
      label: 'Approval Email',
      description: 'Sent when membership request is approved'
    },
    {
      value: 'board',
      label: 'Board Notification',
      description: 'Sent to board members about new requests'
    }
  ]

  const languages = [
    { value: 'en', label: 'English', className: 'font-sweden' },
    { value: 'sv', label: 'Swedish', className: 'font-sweden' },
    { value: 'km', label: 'Khmer (ខ្មែរ)', className: 'font-khmer' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-sweden text-sahakum-navy">Email Templates</h1>
        <p className="text-gray-600 mt-2 font-sweden">
          Preview email templates in different languages
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column - Controls */}
        <div className="lg:col-span-1 space-y-6">

          {/* Template Type Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-sweden flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Template Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedTemplate}
                onValueChange={(value) => setSelectedTemplate(value as any)}
                className="space-y-3"
              >
                {templates.map((template) => (
                  <div key={template.value} className="flex items-start space-x-2">
                    <RadioGroupItem
                      value={template.value}
                      id={template.value}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={template.value}
                      className="font-sweden cursor-pointer flex-1"
                    >
                      <div className="font-medium text-sm">{template.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-sweden flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedLanguage}
                onValueChange={(value) => setSelectedLanguage(value as any)}
                className="space-y-3"
              >
                {languages.map((language) => (
                  <div key={language.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={language.value}
                      id={language.value}
                    />
                    <Label
                      htmlFor={language.value}
                      className={`cursor-pointer ${language.className}`}
                    >
                      {language.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {selectedTemplate === 'board' && (
                <p className="text-xs text-amber-600 mt-3 font-sweden">
                  Board notifications are sent in English only
                </p>
              )}
            </CardContent>
          </Card>

          {/* Template Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-sweden flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-gray-700 space-y-2 font-sweden list-disc list-inside">
                <li>Sahakum Khmer logo</li>
                <li>Swedish Brand colors</li>
                <li>Responsive design</li>
                <li>Multilingual (EN/SV/KM)</li>
                <li>Professional formatting</li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-sweden">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/en/admin/membership-requests"
                className="flex items-center justify-between p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors font-sweden"
              >
                <span className="text-sahakum-navy">Membership Requests</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
              <a
                href="https://github.com/anthropics/claude-code/blob/main/docs/EMAIL_NOTIFICATIONS_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors font-sweden"
              >
                <span className="text-sahakum-navy">Setup Guide</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Email Preview */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-sweden">Email Preview</CardTitle>
                  <CardDescription className="font-sweden mt-1">
                    {templates.find(t => t.value === selectedTemplate)?.label} - {languages.find(l => l.value === selectedLanguage)?.label}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-sweden">
                  Live Preview
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Email Preview iFrame */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <iframe
                  key={`${selectedTemplate}-${selectedLanguage}`}
                  src={getPreviewUrl()}
                  className="w-full h-[calc(100vh-280px)] min-h-[600px] border-0"
                  title="Email Template Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
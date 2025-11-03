'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaSelector } from '@/components/ui/media-selector'

interface BoardMemberFormData {
  slug: string
  firstName: string
  lastName: string
  firstNameKhmer: string
  lastNameKhmer: string
  profileImage: string
  email: string
  phone: string
  order: number
  isChairman: boolean
  active: boolean
  joinedBoard: string
  translations: {
    language: string
    position: string
    education: string
    vision: string
    bio: string
  }[]
}

interface BoardMemberFormProps {
  initialData?: Partial<BoardMemberFormData>
  isEdit?: boolean
  boardMemberId?: string
  locale: string
}

export function BoardMemberForm({
  initialData,
  isEdit = false,
  boardMemberId,
  locale,
}: BoardMemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<BoardMemberFormData>({
    slug: initialData?.slug || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    firstNameKhmer: initialData?.firstNameKhmer || '',
    lastNameKhmer: initialData?.lastNameKhmer || '',
    profileImage: initialData?.profileImage || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    order: initialData?.order || 0,
    isChairman: initialData?.isChairman || false,
    active: initialData?.active !== undefined ? initialData.active : true,
    joinedBoard: initialData?.joinedBoard || '',
    translations: initialData?.translations || [
      { language: 'en', position: '', education: '', vision: '', bio: '' },
      { language: 'sv', position: '', education: '', vision: '', bio: '' },
      { language: 'km', position: '', education: '', vision: '', bio: '' },
    ],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit
        ? `/api/board-members/${boardMemberId}`
        : '/api/board-members'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/${locale}/admin/board-members`)
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save board member')
      }
    } catch (error) {
      console.error('Error saving board member:', error)
      alert('Failed to save board member')
    } finally {
      setLoading(false)
    }
  }

  const updateTranslation = (
    language: string,
    field: string,
    value: string
  ) => {
    setFormData({
      ...formData,
      translations: formData.translations.map((t) =>
        t.language === language ? { ...t, [field]: value } : t
      ),
    })
  }

  const generateSlug = () => {
    const slug = `${formData.firstName}-${formData.lastName}`
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    setFormData({ ...formData, slug })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-sweden">Basic Information</CardTitle>
          <CardDescription className="font-sweden">
            Enter the board member's basic details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-sweden">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstNameKhmer">First Name (Khmer)</Label>
              <Input
                id="firstNameKhmer"
                value={formData.firstNameKhmer}
                onChange={(e) =>
                  setFormData({ ...formData, firstNameKhmer: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastNameKhmer">Last Name (Khmer)</Label>
              <Input
                id="lastNameKhmer"
                value={formData.lastNameKhmer}
                onChange={(e) =>
                  setFormData({ ...formData, lastNameKhmer: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Image</Label>
            <MediaSelector
              value={formData.profileImage}
              onSelect={(url) =>
                setFormData({ ...formData, profileImage: url })
              }
              accept="images"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                className="max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first (0, 1, 2, etc.)
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-sweden-neutral-200 mt-4">
              <div className="flex items-start gap-4 p-4 bg-white border border-sweden-neutral-200">
                <Checkbox
                  id="isChairman"
                  checked={formData.isChairman}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isChairman: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="isChairman" className="cursor-pointer font-semibold text-base text-[var(--sahakum-navy)]">
                    Chairman
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    This member will be featured as the chairman
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white border border-sweden-neutral-200">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="active" className="cursor-pointer font-semibold text-base text-[var(--sahakum-navy)]">
                    Active
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inactive members won't appear on the public page
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinedBoard">Joined Board (Date)</Label>
            <Input
              id="joinedBoard"
              type="date"
              value={formData.joinedBoard}
              onChange={(e) =>
                setFormData({ ...formData, joinedBoard: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-sweden">Multilingual Content</CardTitle>
          <CardDescription className="font-sweden">
            Provide position, education, and vision in all languages
          </CardDescription>
        </CardHeader>
        <CardContent className="font-sweden">
          <Tabs defaultValue="en">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg h-auto">
              <TabsTrigger
                value="en"
                className="font-sweden data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3"
              >
                English
              </TabsTrigger>
              <TabsTrigger
                value="sv"
                className="font-sweden data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3"
              >
                Svenska
              </TabsTrigger>
              <TabsTrigger
                value="km"
                className="font-khmer data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3"
              >
                ខ្មែរ
              </TabsTrigger>
            </TabsList>

            {['en', 'sv', 'km'].map((lang) => {
              const translation = formData.translations.find(
                (t) => t.language === lang
              )
              if (!translation) return null

              return (
                <TabsContent key={lang} value={lang} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="font-sweden text-[var(--sahakum-navy)]">Position</Label>
                    <Input
                      value={translation.position}
                      onChange={(e) =>
                        updateTranslation(lang, 'position', e.target.value)
                      }
                      placeholder="e.g., Chairman, Board Member, Vice Chairman"
                      className={lang === 'km' ? 'font-khmer' : 'font-sweden'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sweden text-[var(--sahakum-navy)]">Education</Label>
                    <Textarea
                      value={translation.education}
                      onChange={(e) =>
                        updateTranslation(lang, 'education', e.target.value)
                      }
                      rows={4}
                      placeholder="Educational background..."
                      className={lang === 'km' ? 'font-khmer' : 'font-sweden'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sweden text-[var(--sahakum-navy)]">Vision</Label>
                    <Textarea
                      value={translation.vision}
                      onChange={(e) =>
                        updateTranslation(lang, 'vision', e.target.value)
                      }
                      rows={4}
                      placeholder="Vision for the association..."
                      className={lang === 'km' ? 'font-khmer' : 'font-sweden'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-sweden text-[var(--sahakum-navy)]">Bio (Optional)</Label>
                    <Textarea
                      value={translation.bio}
                      onChange={(e) =>
                        updateTranslation(lang, 'bio', e.target.value)
                      }
                      rows={4}
                      placeholder="Short biography..."
                      className={lang === 'km' ? 'font-khmer' : 'font-sweden'}
                    />
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/admin/board-members`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

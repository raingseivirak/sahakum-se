"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, User, Globe, UserCheck, AlertCircle } from "lucide-react"

interface Member {
  id: string
  memberNumber: string | null
  firstName: string
  lastName: string
  firstNameKhmer: string | null
  lastNameKhmer: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  memberType: 'REGULAR' | 'BOARD' | 'VOLUNTEER' | 'HONORARY' | 'LIFETIME'
  joinedDate: string
  isActive: boolean
  notes: string | null
  emergencyContact: string | null
  createdAt: string
  updatedAt: string
}

interface MemberEditFormProps {
  member: Member
  locale: string
}

export function MemberEditForm({ member, locale }: MemberEditFormProps) {
  const router = useRouter()
  const fontClass = 'font-sweden'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    memberNumber: member.memberNumber || "",
    firstName: member.firstName,
    lastName: member.lastName,
    firstNameKhmer: member.firstNameKhmer || "",
    lastNameKhmer: member.lastNameKhmer || "",
    email: member.email || "",
    phone: member.phone || "",
    address: member.address || "",
    city: member.city || "",
    postalCode: member.postalCode || "",
    country: member.country || "Sweden",
    memberType: member.memberType,
    joinedDate: new Date(member.joinedDate).toISOString().split('T')[0],
    isActive: member.isActive,
    notes: member.notes || "",
    emergencyContact: member.emergencyContact || "",
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("First name and last name are required")
      }

      if (!formData.joinedDate) {
        throw new Error("Joined date is required")
      }

      const submitData = {
        ...formData,
        memberNumber: formData.memberNumber || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postalCode: formData.postalCode || null,
        country: formData.country || null,
        firstNameKhmer: formData.firstNameKhmer || null,
        lastNameKhmer: formData.lastNameKhmer || null,
        notes: formData.notes || null,
        emergencyContact: formData.emergencyContact || null,
        joinedDate: new Date(formData.joinedDate).toISOString(),
      }

      const response = await fetch(`/api/members/${member.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update member")
      }

      // Redirect back to members list
      router.push(`/${locale}/admin/members`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getMemberTypeBadge = (type: string) => {
    const typeMap = {
      'REGULAR': { label: 'Regular', className: 'bg-blue-500' },
      'BOARD': { label: 'Board', className: 'bg-purple-500' },
      'VOLUNTEER': { label: 'Volunteer', className: 'bg-green-500' },
      'HONORARY': { label: 'Honorary', className: 'bg-yellow-500' },
      'LIFETIME': { label: 'Lifetime', className: 'bg-red-500' }
    }

    const typeConfig = typeMap[type as keyof typeof typeMap] || { label: type, className: 'bg-gray-500' }

    return (
      <Badge variant="default" className={typeConfig.className}>
        {typeConfig.label}
      </Badge>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Member Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                <UserCheck className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription className={fontClass}>
                Basic member information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className={fontClass}>
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={fontClass}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className={fontClass}>
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={fontClass}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Khmer Names Section */}
              <div className="space-y-3">
                <div className={`flex items-center gap-2 ${fontClass}`}>
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">Khmer Names (Optional)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstNameKhmer" className={fontClass}>
                      First Name (Khmer)
                    </Label>
                    <Input
                      id="firstNameKhmer"
                      value={formData.firstNameKhmer}
                      onChange={(e) => handleInputChange("firstNameKhmer", e.target.value)}
                      className={fontClass}
                      placeholder="ឈ្មោះដំបូង"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastNameKhmer" className={fontClass}>
                      Last Name (Khmer)
                    </Label>
                    <Input
                      id="lastNameKhmer"
                      value={formData.lastNameKhmer}
                      onChange={(e) => handleInputChange("lastNameKhmer", e.target.value)}
                      className={fontClass}
                      placeholder="នាមត្រកូល"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className={fontClass}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={fontClass}
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className={fontClass}>
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={fontClass}
                    placeholder="+46 70 123 45 67"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className={fontClass}>Address Information</CardTitle>
              <CardDescription className={fontClass}>
                Member's residential address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address" className={fontClass}>
                  Street Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={fontClass}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city" className={fontClass}>
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className={fontClass}
                    placeholder="Stockholm"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" className={fontClass}>
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    className={fontClass}
                    placeholder="123 45"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className={fontClass}>
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    className={fontClass}
                    placeholder="Sweden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className={fontClass}>Additional Information</CardTitle>
              <CardDescription className={fontClass}>
                Emergency contact and internal notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="emergencyContact" className={fontClass}>
                  Emergency Contact
                </Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  className={fontClass}
                  placeholder="Name and phone number of emergency contact"
                />
                <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
                  Contact person in case of emergencies
                </p>
              </div>

              <div>
                <Label htmlFor="notes" className={fontClass}>
                  Internal Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className={fontClass}
                  rows={3}
                  placeholder="Any additional notes about this member..."
                />
                <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
                  Internal notes visible only to administrators
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Membership Details */}
          <Card>
            <CardHeader>
              <CardTitle className={fontClass}>Membership Details</CardTitle>
              <CardDescription className={fontClass}>
                Membership type and status information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="memberNumber" className={fontClass}>
                  Member Number
                </Label>
                <Input
                  id="memberNumber"
                  value={formData.memberNumber}
                  onChange={(e) => handleInputChange("memberNumber", e.target.value)}
                  className={fontClass}
                  placeholder="Optional member ID"
                />
                <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
                  Optional unique member identifier
                </p>
              </div>

              <div>
                <Label htmlFor="memberType" className={fontClass}>
                  Member Type *
                </Label>
                <Select
                  value={formData.memberType}
                  onValueChange={(value) => handleInputChange("memberType", value)}
                >
                  <SelectTrigger className={fontClass}>
                    <SelectValue placeholder="Select member type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular Member</SelectItem>
                    <SelectItem value="BOARD">Board Member</SelectItem>
                    <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                    <SelectItem value="HONORARY">Honorary Member</SelectItem>
                    <SelectItem value="LIFETIME">Lifetime Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="joinedDate" className={fontClass}>
                  Joined Date *
                </Label>
                <Input
                  id="joinedDate"
                  type="date"
                  value={formData.joinedDate}
                  onChange={(e) => handleInputChange("joinedDate", e.target.value)}
                  className={fontClass}
                  required
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="isActive" className={fontClass}>
                    Active Member
                  </Label>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>
                    Member is currently active in the association
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className={fontClass}>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="submit"
                className={`w-full ${fontClass}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Member...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Member
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileForm } from './profile-form'

export default async function AdminProfilePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || !['ADMIN', 'BOARD', 'EDITOR', 'MODERATOR', 'AUTHOR'].includes(session.user.role)) {
    redirect(`/${locale}/auth/signin`)
  }

  const fontClass = 'font-sweden'

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
                <BreadcrumbLink href={`/${locale}/admin`} className={fontClass}>
                  {locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : locale === 'sv' ? 'Instrumentpanel' : 'Dashboard'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>
                  {locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : locale === 'sv' ? 'Min profil' : 'My Profile'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-2">
            <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
              {locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : locale === 'sv' ? 'Min profil' : 'My Profile'}
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              {locale === 'km'
                ? 'គ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នក និងប្តូរពាក្យសម្ងាត់'
                : locale === 'sv'
                ? 'Hantera din kontoinformation och byt lösenord'
                : 'Manage your account information and change your password'
              }
            </p>
          </div>
          <div className={`bg-white border rounded-lg p-4 shadow-sm ${fontClass}`}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={session.user?.profileImage || undefined}
                  alt={session.user?.name || 'User'}
                />
                <AvatarFallback className="bg-sahakum-navy text-white font-semibold text-sm">
                  {session.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="font-semibold text-sahakum-navy text-sm">
                  {session.user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {session.user?.role?.toLowerCase() || 'Admin'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProfileForm locale={locale} />
      </div>
    </div>
  )
}
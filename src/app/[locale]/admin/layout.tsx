import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminPermissionsProvider } from "@/contexts/admin-permissions-context"
import { Metadata } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

interface AdminLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  // Check authentication server-side
  const session = await getServerSession(authOptions)

  // Redirect to signin if not authenticated
  if (!session?.user?.id) {
    redirect(`/${params.locale}/auth/signin?callbackUrl=${encodeURIComponent(`/${params.locale}/admin`)}`)
  }

  // Check if user has admin access (AUTHOR or higher)
  const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
  if (!allowedRoles.includes(session.user.role)) {
    redirect(`/${params.locale}/auth/signin?error=insufficient_privileges`)
  }

  return (
    <AdminPermissionsProvider>
      <SidebarProvider>
        <AdminSidebar locale={params.locale} />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminPermissionsProvider>
  )
}
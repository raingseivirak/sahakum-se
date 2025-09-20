import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminPermissionsProvider } from "@/contexts/admin-permissions-context"
import { Metadata } from 'next'

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

export default function AdminLayout({ children, params }: AdminLayoutProps) {
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
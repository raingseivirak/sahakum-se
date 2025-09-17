import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar locale={params.locale} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
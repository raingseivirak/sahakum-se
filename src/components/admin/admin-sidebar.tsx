"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Tags,
  FolderOpen,
  Image,
  Settings,
  Globe,
  ChefHat,
  Newspaper,
  BookOpen,
  LogOut,
  User,
  Grid3X3,
  UserCheck,
  ClipboardList,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  locale: string
}

// Admin navigation items with trilingual support
const getNavigationItems = (locale: string) => ({
  main: [
    {
      title: locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : locale === 'sv' ? 'Instrumentpanel' : 'Dashboard',
      url: `/${locale}/admin`,
      icon: LayoutDashboard,
    },
  ],
  content: [
    {
      title: locale === 'km' ? 'ទំព័រ' : locale === 'sv' ? 'Sidor' : 'Pages',
      url: `/${locale}/admin/pages`,
      icon: FileText,
      items: [
        {
          title: locale === 'km' ? 'ទំព័រទាំងអស់' : locale === 'sv' ? 'Alla sidor' : 'All Pages',
          url: `/${locale}/admin/pages`,
        },
        {
          title: locale === 'km' ? 'បង្កើតទំព័រ' : locale === 'sv' ? 'Skapa sida' : 'Create Page',
          url: `/${locale}/admin/pages/create`,
        },
      ],
    },
    {
      title: locale === 'km' ? 'ប្រកាស' : locale === 'sv' ? 'Inlägg' : 'Posts',
      url: `/${locale}/admin/posts`,
      icon: Newspaper,
      items: [
        {
          title: locale === 'km' ? 'ប្រកាសទាំងអស់' : locale === 'sv' ? 'Alla inlägg' : 'All Posts',
          url: `/${locale}/admin/posts`,
        },
        {
          title: locale === 'km' ? 'បង្កើតប្រកាស' : locale === 'sv' ? 'Skapa inlägg' : 'Create Post',
          url: `/${locale}/admin/posts/create`,
        },
      ],
    },
    {
      title: locale === 'km' ? 'ព្រឹត្តិការណ៍' : locale === 'sv' ? 'Evenemang' : 'Events',
      url: `/${locale}/admin/events`,
      icon: Calendar,
      items: [
        {
          title: locale === 'km' ? 'ព្រឹត្តិការណ៍ទាំងអស់' : locale === 'sv' ? 'Alla evenemang' : 'All Events',
          url: `/${locale}/admin/events`,
        },
        {
          title: locale === 'km' ? 'បង្កើតព្រឹត្តិការណ៍' : locale === 'sv' ? 'Skapa evenemang' : 'Create Event',
          url: `/${locale}/admin/events/create`,
        },
      ],
    },
    {
      title: locale === 'km' ? 'រូបមន្ត' : locale === 'sv' ? 'Recept' : 'Recipes',
      url: `/${locale}/admin/recipes`,
      icon: ChefHat,
      items: [
        {
          title: locale === 'km' ? 'រូបមន្តទាំងអស់' : locale === 'sv' ? 'Alla recept' : 'All Recipes',
          url: `/${locale}/admin/recipes`,
        },
        {
          title: locale === 'km' ? 'បង្កើតរូបមន្ត' : locale === 'sv' ? 'Skapa recept' : 'Create Recipe',
          url: `/${locale}/admin/recipes/create`,
        },
      ],
    },
    {
      title: locale === 'km' ? 'ប្រព័ន្ធព័ត៌មាន' : locale === 'sv' ? 'Nyheter' : 'News',
      url: `/${locale}/admin/news`,
      icon: BookOpen,
      items: [
        {
          title: locale === 'km' ? 'ព័ត៌មានទាំងអស់' : locale === 'sv' ? 'Alla nyheter' : 'All News',
          url: `/${locale}/admin/news`,
        },
        {
          title: locale === 'km' ? 'បង្កើតព័ត៌មាន' : locale === 'sv' ? 'Skapa nyhet' : 'Create News',
          url: `/${locale}/admin/news/create`,
        },
      ],
    },
  ],
  organization: [
    {
      title: locale === 'km' ? 'សំណើសមាជិក' : locale === 'sv' ? 'Medlemsansökningar' : 'Membership Requests',
      url: `/${locale}/admin/membership-requests`,
      icon: ClipboardList,
    },
    {
      title: locale === 'km' ? 'សមាជិក' : locale === 'sv' ? 'Medlemmar' : 'Members',
      url: `/${locale}/admin/members`,
      icon: UserCheck,
      items: [
        {
          title: locale === 'km' ? 'សមាជិកទាំងអស់' : locale === 'sv' ? 'Alla medlemmar' : 'All Members',
          url: `/${locale}/admin/members`,
        },
        {
          title: locale === 'km' ? 'បន្ថែមសមាជិក' : locale === 'sv' ? 'Lägg till medlem' : 'Add Member',
          url: `/${locale}/admin/members/create`,
        },
      ],
    },
    {
      title: locale === 'km' ? 'សេវាកម្ម' : locale === 'sv' ? 'Tjänster' : 'Services',
      url: `/${locale}/admin/services`,
      icon: Grid3X3,
      items: [
        {
          title: locale === 'km' ? 'សេវាកម្មទាំងអស់' : locale === 'sv' ? 'Alla tjänster' : 'All Services',
          url: `/${locale}/admin/services`,
        },
        {
          title: locale === 'km' ? 'បង្កើតសេវាកម្ម' : locale === 'sv' ? 'Skapa tjänst' : 'Create Service',
          url: `/${locale}/admin/services/create`,
        },
      ],
    },
    {
      title: locale === 'km' ? 'ប្រភេទ' : locale === 'sv' ? 'Kategorier' : 'Categories',
      url: `/${locale}/admin/categories`,
      icon: FolderOpen,
    },
    {
      title: locale === 'km' ? 'ស្លាក' : locale === 'sv' ? 'Taggar' : 'Tags',
      url: `/${locale}/admin/tags`,
      icon: Tags,
    },
    {
      title: locale === 'km' ? 'មេឌៀ' : locale === 'sv' ? 'Media' : 'Media',
      url: `/${locale}/admin/media`,
      icon: Image,
    },
  ],
  system: [
    {
      title: locale === 'km' ? 'អ្នកប្រើប្រាស់' : locale === 'sv' ? 'Användare' : 'Users',
      url: `/${locale}/admin/users`,
      icon: Users,
    },
    {
      title: locale === 'km' ? 'ការកំណត់' : locale === 'sv' ? 'Inställningar' : 'Settings',
      url: `/${locale}/admin/settings`,
      icon: Settings,
    },
  ],
})

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const navItems = getNavigationItems(locale)

  const isActive = (url: string, hasSubItems: boolean = false) => {
    // Always match exactly for dashboard
    if (url === `/${locale}/admin`) {
      return pathname === url
    }

    // For sub-routes like /create, /edit, etc - match exactly
    if (url.includes('/create') || url.includes('/edit')) {
      return pathname === url
    }

    // For parent items with sub-items, never highlight them directly
    if (hasSubItems) {
      return false
    }

    // For list pages (like /admin/posts), match exactly
    return pathname === url
  }

  return (
    <Sidebar variant="floating" className="border-r border-sweden-neutral-200 bg-white">
      <SidebarHeader className="border-b border-sweden-neutral-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sahakum-gold rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">SK</span>
          </div>
          <div>
            <h1 className="font-sweden text-lg font-semibold text-sahakum-navy">
              {locale === 'km' ? 'សហគមន៍ខ្មែរ' : 'Sahakum Khmer'}
            </h1>
            <p className="text-xs text-sweden-neutral-500 font-sweden">
              {locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : locale === 'sv' ? 'Administratör' : 'Admin Panel'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        {/* Main Navigation */}
        <SidebarGroup className="bg-white">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className="font-sweden">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management */}
        <SidebarGroup className="bg-white">
          <SidebarGroupLabel className="font-sweden">
            {locale === 'km' ? 'គ្រប់គ្រងមាតិកា' : locale === 'sv' ? 'Innehållshantering' : 'Content Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {navItems.content.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, !!item.items)}>
                    <Link href={item.url} className="font-sweden">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isActive(subItem.url)} className="font-sweden">
                            <Link href={subItem.url} className="font-sweden text-sm">
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization */}
        <SidebarGroup className="bg-white">
          <SidebarGroupLabel className="font-sweden">
            {locale === 'km' ? 'ការរៀបចំ' : locale === 'sv' ? 'Organisation' : 'Organization'}
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {navItems.organization.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className="font-sweden">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup className="bg-white">
          <SidebarGroupLabel className="font-sweden">
            {locale === 'km' ? 'ប្រព័ន្ធ' : locale === 'sv' ? 'System' : 'System'}
          </SidebarGroupLabel>
          <SidebarGroupContent className="bg-white">
            <SidebarMenu>
              {navItems.system.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className="font-sweden">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sweden-neutral-200 p-4">
        {session && (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sweden-neutral-50">
              <div className="w-8 h-8 bg-sahakum-gold rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sahakum-navy truncate font-sweden">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-sweden-neutral-500 font-sweden">
                  {session.user.role}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/admin/profile`}
                  className="flex items-center gap-2 text-xs text-sweden-neutral-600 hover:text-sweden-blue-primary !font-sweden px-2 py-1 rounded hover:bg-sweden-neutral-50"
                >
                  <User className="h-3 w-3" />
                  {locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : locale === 'sv' ? 'Min profil' : 'My Profile'}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sweden-neutral-500" />
                  <Badge variant="outline" className="font-sweden text-xs">
                    {locale.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}`}
                    className="text-xs text-sweden-neutral-500 hover:text-sweden-blue-primary !font-sweden"
                  >
                    View Site
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({
                      callbackUrl: "/en/auth/signin",
                      redirect: true
                    })}
                    className="h-6 px-2 text-xs text-sweden-neutral-500 hover:text-destructive !font-sweden"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, FolderKanban, Calendar, User, LucideIcon, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface MyAccountNavProps {
  locale: string
  fontClass: string
}

export function MyAccountNav({ locale, fontClass }: MyAccountNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation: NavItem[] = [
    {
      name: { en: 'Dashboard', sv: 'Översikt', km: 'ផ្ទាំងគ្រប់គ្រង' }[locale] || 'Dashboard',
      href: `/${locale}/my-account`,
      icon: Home,
    },
    {
      name: { en: 'My Initiatives', sv: 'Mina Initiativ', km: 'គម្រោងរបស់ខ្ញុំ' }[locale] || 'My Initiatives',
      href: `/${locale}/my-account/initiatives`,
      icon: FolderKanban,
    },
    {
      name: { en: 'My Events', sv: 'Mina Evenemang', km: 'ព្រឹត្តិការណ៍របស់ខ្ញុំ' }[locale] || 'My Events',
      href: `/${locale}/my-account/events`,
      icon: Calendar,
    },
    {
      name: { en: 'Profile', sv: 'Profil', km: 'ប្រវត្តិរូប' }[locale] || 'Profile',
      href: `/${locale}/my-account/profile`,
      icon: User,
    },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/my-account`) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  const getCurrentPageName = () => {
    const current = navigation.find(item => isActive(item.href))
    return current?.name || navigation[0].name
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-between border-[var(--sahakum-navy)]/20 rounded-none ${fontClass}`}
            >
              <span className="flex items-center space-x-2">
                <Menu className="h-4 w-4" />
                <span>{getCurrentPageName()}</span>
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-white border-[var(--sahakum-navy)]/20 rounded-none">
            <SheetHeader>
              <SheetTitle className={`text-[var(--sahakum-navy)] ${fontClass}`}>
                {locale === 'sv' ? 'Meny' : locale === 'km' ? 'ម៉ឺនុយ' : 'Menu'}
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-none transition-colors ${fontClass} ${
                      active
                        ? 'bg-[var(--sahakum-gold)]/10 text-[var(--sahakum-navy)] border-l-4 border-[var(--sahakum-gold)]'
                        : 'text-gray-600 hover:bg-[var(--sahakum-gold)]/5 hover:text-[var(--sahakum-navy)]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Tabs */}
      <nav className="hidden md:flex space-x-8">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${fontClass} ${
                active
                  ? 'border-[var(--sahakum-gold)] text-[var(--sahakum-navy)]'
                  : 'border-transparent text-gray-600 hover:border-[var(--sahakum-gold)] hover:text-[var(--sahakum-navy)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

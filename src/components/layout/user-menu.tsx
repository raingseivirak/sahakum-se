'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, Shield, Home } from 'lucide-react';
import { type Language } from '@/lib/constants';

interface UserMenuProps {
  locale: Language;
  translations: {
    sign_in: string;
    sign_out: string;
    admin: string;
    profile: string;
    settings: string;
    my_account?: string;
  };
  currentUrl?: string;
}

export function UserMenu({ locale, translations, currentUrl }: UserMenuProps) {
  const { data: session, status } = useSession();

  // Determine font class based on locale
  const getFontClass = () => {
    switch (locale) {
      case 'km':
        return 'font-khmer';
      case 'sv':
      case 'en':
        return 'font-sweden';
      default:
        return 'font-multilingual';
    }
  };

  const fontClass = getFontClass();

  // Show loading state
  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 text-xs bg-[var(--sahakum-gold)]/20 rounded-sm animate-pulse ${fontClass}`}>
        <User className="w-3 h-3 text-[var(--sahakum-gold)]/50" />
        <span className="text-[var(--sahakum-gold)]/50">...</span>
      </div>
    );
  }

  // Show sign in button if not authenticated
  if (status === 'unauthenticated' || !session) {
    const signinUrl = currentUrl
      ? `/${locale}/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`
      : `/${locale}/auth/signin`;

    return (
      <Link href={signinUrl}>
        <div className={`flex items-center space-x-1 px-2 py-1 text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/30 rounded-sm transition-colors ${fontClass} cursor-pointer`}>
          <User className="w-3 h-3" />
          <span>{translations.sign_in}</span>
        </div>
      </Link>
    );
  }

  // Check if user has admin access (AUTHOR or higher)
  const allowedAdminRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN'];
  const hasAdminAccess = allowedAdminRoles.includes(session.user.role);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    const redirectUrl = currentUrl || `/${locale}`;
    signOut({ callbackUrl: redirectUrl });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-1 px-2 py-1 text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/30 rounded-sm transition-colors ${fontClass} cursor-pointer`}>
        <User className="w-3 h-3" />
        <span>{session.user.name?.split(' ')[0] || 'User'}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-84 sm:w-96 bg-gradient-to-br from-white to-slate-100/80 border-2 border-[var(--sahakum-navy)]/20 shadow-2xl p-0 z-[9999] backdrop-blur-md overflow-hidden max-w-[calc(100vw-2rem)] rounded-none"
        align="end"
        sideOffset={12}
      >
        {/* User Info Section - Swedish Brand Rectangular Design */}
        <div className="relative px-4 sm:px-6 py-6 sm:py-8 bg-[var(--sahakum-navy)] overflow-hidden">
          {/* Decorative Swedish-inspired pattern - rectangular elements */}
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 opacity-10">
            <div className="w-full h-full bg-[var(--sahakum-gold)] transform rotate-45 translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 opacity-5">
            <div className="w-full h-full bg-[var(--sahakum-gold)] transform -translate-x-8 sm:-translate-x-12 translate-y-8 sm:translate-y-12"></div>
          </div>

          <div className="relative flex items-center gap-3 sm:gap-5">
            <div className="relative">
              <Avatar className="h-14 w-14 sm:h-18 sm:w-18 border-3 border-[var(--sahakum-gold)] shadow-xl ring-4 ring-[var(--sahakum-gold)]/20">
                <AvatarImage
                  src={session.user.profileImage || undefined}
                  alt={session.user.name || 'User'}
                />
                <AvatarFallback className="bg-gradient-to-br from-[var(--sahakum-gold)] to-[var(--sahakum-gold)]/80 text-[var(--sahakum-navy)] font-bold font-sweden text-lg sm:text-xl">
                  {getInitials(session.user.name || session.user.email || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col space-y-1.5 sm:space-y-2.5 leading-none min-w-0 flex-1">
              {session.user.name && (
                <p className={`${fontClass} font-bold text-white truncate text-lg sm:text-xl tracking-wide`}>{session.user.name}</p>
              )}
              <p className={`${fontClass} text-xs sm:text-sm text-[var(--sahakum-gold)] truncate tracking-wide`}>
                {session.user.email}
              </p>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs ${fontClass} font-bold bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] shadow-md border border-[var(--sahakum-gold)]/20`}>
                  <div className="w-2 h-2 bg-[var(--sahakum-navy)] mr-2"></div>
                  {session.user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section - Swedish Brand Rectangular Cards */}
        <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 bg-gradient-to-b from-white to-slate-200/60">
          {/* My Account - For ALL users */}
          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/my-account`}
              className="cursor-pointer group relative flex items-center w-full p-3 sm:p-4 bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden rounded-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center w-full">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[var(--sahakum-navy)]/20 mr-3 sm:mr-4 group-hover:bg-[var(--sahakum-navy)]/30 transition-colors rounded-none">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sahakum-navy)]" />
                </div>
                <span className={`${fontClass} font-semibold text-sm sm:text-base tracking-wide`}>
                  {translations.my_account || (locale === 'sv' ? 'Mitt Konto' : locale === 'km' ? 'គណនីរបស់ខ្ញុំ' : 'My Account')}
                </span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-[var(--sahakum-navy)]"></div>
                </div>
              </div>
            </Link>
          </DropdownMenuItem>

          {/* Admin Dashboard - Only for users with admin roles */}
          {hasAdminAccess && (
            <>
              <DropdownMenuSeparator className="bg-[var(--sahakum-navy)]/10" />
              <DropdownMenuItem asChild>
                <Link
                  href="/en/admin"
                  className="cursor-pointer group relative flex items-center w-full p-3 sm:p-4 bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden rounded-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--sahakum-gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center w-full">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[var(--sahakum-gold)]/20 mr-3 sm:mr-4 group-hover:bg-[var(--sahakum-gold)]/30 transition-colors rounded-none">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--sahakum-gold)]" />
                    </div>
                    <span className={`${fontClass} font-semibold text-sm sm:text-base tracking-wide`}>
                      {locale === 'sv' ? 'Admin' : locale === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Admin Dashboard'}
                    </span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-[var(--sahakum-gold)]"></div>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </div>

        {/* Sign Out Section - Swedish Brand Rectangular Destructive Action */}
        <div className="border-t border-slate-200/50 bg-gradient-to-b from-slate-100/60 to-white p-3 sm:p-5">
          <DropdownMenuItem
            className="cursor-pointer group relative flex items-center w-full p-3 sm:p-4 bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden rounded-none"
            onClick={handleSignOut}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center w-full">
              <div className="flex items-center justify-center w-12 h-12 bg-[var(--sahakum-gold)] mr-3 sm:mr-4 transition-colors rounded-none">
                <LogOut className="h-6 w-6 text-[var(--sahakum-navy)]" />
              </div>
              <span className={`${fontClass} font-semibold text-sm sm:text-base tracking-wide`}>{translations.sign_out}</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-white"></div>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
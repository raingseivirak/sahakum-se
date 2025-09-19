import { Metadata } from 'next'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Sign In - Sahakum Khmer CMS',
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

export default function AuthLayout({ children }: AuthLayoutProps) {
  return children
}
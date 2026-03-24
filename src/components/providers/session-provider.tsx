"use client"

import { SessionProvider } from "next-auth/react"
import { type Session } from "next-auth"
import { ReactNode } from "react"
import { PostSigninHandler } from "@/components/auth/post-signin-handler"

interface ProvidersProps {
  children: ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <PostSigninHandler />
      {children}
    </SessionProvider>
  )
}
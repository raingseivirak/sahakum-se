"use client"

import { SessionProvider } from "next-auth/react"
import { type Session } from "next-auth"
import { ReactNode, Suspense } from "react"
import { PostSigninHandler } from "@/components/auth/post-signin-handler"
import { NavigationProgress } from "@/components/ui/navigation-progress"
import { ProgressStarter } from "@/components/ui/progress-starter"

interface ProvidersProps {
  children: ReactNode
  session?: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <PostSigninHandler />
      <ProgressStarter />
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      {children}
    </SessionProvider>
  )
}
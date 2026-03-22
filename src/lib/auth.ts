import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// Gmail: user@gmail.com and u.s.e.r@gmail.com are the same inbox - normalize for lookup
function normalizeGmail(email: string): string {
  const [local, domain] = email.toLowerCase().split("@")
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `${local.replace(/\./g, "")}@${domain}`
  }
  return email.toLowerCase()
}

async function findUserByEmailWithGmailNormalization(email: string) {
  const normalized = normalizeGmail(email)
  const gmailUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { endsWith: "@gmail.com" } },
        { email: { endsWith: "@googlemail.com" } },
      ],
    },
  })
  return gmailUsers.find((u) => normalizeGmail(u.email) === normalized) ?? null
}

async function findMemberByEmailWithGmailNormalization(email: string) {
  const member = await prisma.member.findFirst({ where: { email } })
  if (member) return member
  const normalized = normalizeGmail(email)
  const gmailMembers = await prisma.member.findMany({
    where: {
      OR: [
        { email: { endsWith: "@gmail.com" } },
        { email: { endsWith: "@googlemail.com" } },
      ],
    },
  })
  return gmailMembers.find((m) => normalizeGmail(m.email) === normalized) ?? null
}

const baseAdapter = PrismaAdapter(prisma) as any
const adapter = {
  ...baseAdapter,
  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) return user
    // Gmail: try normalized match (u.s.e.r@gmail.com matches user@gmail.com)
    return findUserByEmailWithGmailNormalization(email)
  },
}

const providers = [
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim()
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage ?? user.image,
        }
      }
    }),
  // OAuth providers - support separate dev credentials for local (avoids "OAuth client was not found")
  ...(function () {
    const isDev = process.env.NEXTAUTH_URL?.includes("localhost")
    const clientId = (isDev && process.env.GOOGLE_CLIENT_ID_DEV)
      ? process.env.GOOGLE_CLIENT_ID_DEV.trim()
      : process.env.GOOGLE_CLIENT_ID?.trim()
    const clientSecret = (isDev && process.env.GOOGLE_CLIENT_SECRET_DEV)
      ? process.env.GOOGLE_CLIENT_SECRET_DEV.trim()
      : process.env.GOOGLE_CLIENT_SECRET?.trim()
    return clientId && clientSecret
      ? [
          GoogleProvider({
            clientId,
            clientSecret,
            allowDangerousEmailAccountLinking: true,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []
  })(),
  ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ? [
        FacebookProvider({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true, // Link to existing user when same email (e.g. credentials → OAuth)
        }),
      ]
    : []),
]

export const authOptions: NextAuthOptions = {
  adapter,
  providers,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) {
          return "/en/auth/signin?error=AccountNotFound"
        }
        // OAuth auto-creates accounts via PrismaAdapter; no gate needed.
        // The createUser event below links to existing Member records.
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, populate token from user object and fetch member status
      if (user) {
        token.role = user.role
        token.profileImage = (user as { profileImage?: string; image?: string }).profileImage ?? (user as { profileImage?: string; image?: string }).image
        const member = await prisma.member.findFirst({
          where: { userId: user.id },
          select: { id: true }
        })
        token.isMember = !!member
        token.tokenFetchedAt = Date.now()
      }

      // Handle session updates (when update() is called) — force a refresh next request
      if (trigger === "update" && session) {
        token.profileImage = session.profileImage
        token.tokenFetchedAt = 0
      }

      // Refresh user data from DB at most once every 5 minutes
      const REFRESH_INTERVAL_MS = 5 * 60 * 1000
      const shouldRefresh = token.sub && (
        !token.tokenFetchedAt ||
        Date.now() - token.tokenFetchedAt > REFRESH_INTERVAL_MS
      )
      if (shouldRefresh) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { profileImage: true, image: true, role: true, name: true, email: true, member: { select: { id: true } } }
        })
        if (freshUser) {
          token.profileImage = freshUser.profileImage ?? freshUser.image
          token.role = freshUser.role
          token.isMember = !!freshUser.member
          token.tokenFetchedAt = Date.now()
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role as UserRole
        session.user.profileImage = token.profileImage
        session.user.isMember = token.isMember
      }
      return session
    }
  },
  pages: {
    signIn: "/en/auth/signin",
    signOut: "/en/auth/signin",
    error: "/en/auth/signin",
  },
  events: {
    async signOut(message) {
      // Clear any additional cookies or session data if needed
      console.log('User signed out:', message)
    },
    async createUser({ user }) {
      // Link OAuth-created users to Member records when email matches
      if (user.email) {
        const member = await prisma.member.findFirst({
          where: { email: user.email, userId: null },
        })
        if (member) {
          await prisma.member.update({
            where: { id: member.id },
            data: { userId: user.id },
          })
        }
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
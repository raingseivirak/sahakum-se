import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
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
            email: credentials.email
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
          profileImage: user.profileImage,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.profileImage = user.profileImage
      }

      // Handle session updates (when update() is called)
      if (trigger === "update" && session) {
        token.profileImage = session.profileImage
      }

      // Always fetch fresh user data to ensure profileImage is current
      if (token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { profileImage: true, role: true, name: true, email: true }
        })
        if (freshUser) {
          token.profileImage = freshUser.profileImage
          token.role = freshUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role as UserRole
        session.user.profileImage = token.profileImage
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
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
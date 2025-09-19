import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: UserRole
      profileImage?: string
    }
  }

  interface User {
    role: UserRole
    profileImage?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    profileImage?: string
  }
}
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Only allow specific Gmail domains or specific email addresses
            if (user.email) {
                // Allow specific admin emails
                const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',') || []
                if (allowedEmails.includes(user.email)) {
                    return true
                }

                // Allow specific Gmail domains if configured
                const allowedDomains = process.env.ALLOWED_GMAIL_DOMAINS?.split(',') || []
                const userDomain = user.email.split('@')[1]
                if (allowedDomains.includes(userDomain)) {
                    return true
                }
            }

            return false // Deny access to unauthorized emails
        },
        async session({ session, user }) {
            // Add user role and ID to session
            if (session.user) {
                session.user.id = user.id
                session.user.role = user.role
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: string
        }
    }

    interface User {
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        id: string
    }
}




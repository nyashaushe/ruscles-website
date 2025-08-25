import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Only allow specific admin email
            if (user.email) {
                // Allow specific admin email
                const allowedEmails = ['ruscleinvestments@gmail.com']
                if (allowedEmails.includes(user.email)) {
                    return true
                }

                // Also allow gmail.com domain as fallback
                const userDomain = user.email.split('@')[1]
                if (userDomain === 'gmail.com') {
                    return true
                }
            }

            return false // Deny access to unauthorized emails
        },
        async jwt({ token, user, account }) {
            // Persist user data in the token
            if (user) {
                token.user = user
            }
            return token
        },
        async session({ session, token }) {
            // Send properties to the client
            if (token.user) {
                session.user = token.user as any
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}




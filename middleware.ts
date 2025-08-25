import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // Check if user is trying to access admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const token = req.nextauth.token

            // If no token, redirect to sign in
            if (!token) {
                return NextResponse.redirect(new URL("/auth/signin", req.url))
            }

            // For now, allow any authenticated user to access admin routes
            // The signIn callback in auth.ts will handle email restrictions
            return NextResponse.next()
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: ["/admin/:path*"]
}




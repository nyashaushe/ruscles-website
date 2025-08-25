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

            // Check if user has admin role
            if (token.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/auth/error?error=AccessDenied", req.url))
            }
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




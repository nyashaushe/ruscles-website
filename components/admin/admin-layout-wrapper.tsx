'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminLayoutWrapperProps {
    children: ReactNode
    navbar: ReactNode
    footer: ReactNode
}

export function AdminLayoutWrapper({ children, navbar, footer }: AdminLayoutWrapperProps) {
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith('/admin')
    const isAuthRoute = pathname?.startsWith('/auth')

    // For admin routes and auth routes, only render the main content without navbar and footer
    if (isAdminRoute || isAuthRoute) {
        return <>{children}</>
    }

    // For non-admin routes, render navbar, main content, and footer
    return (
        <>
            {navbar}
            <main>{children}</main>
            {footer}
        </>
    )
}

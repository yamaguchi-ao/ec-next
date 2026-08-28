import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from './lib/jwt/auth';
import { getAuthCookie } from './lib/jwt/cookie';

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const publicPaths = ["/login", "/signup"];
    const protectedPath = ["/products", "/dashboard", "/users", "/cart"];

    const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const isProtectedPath = protectedPath.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    const currentUrl = new URL("/login", req.url);
    const token = await getAuthCookie();

    if (!token && isProtectedPath) {
        currentUrl.searchParams.set("reason", "session_expired");
        return NextResponse.redirect(currentUrl);
    }

    if (token) {
        try {
            const user = await getCurrentUser();

            if (!user) {
                currentUrl.searchParams.set("reason", "session_expired");
                return NextResponse.redirect(currentUrl);
            }


            if (isPublicPath) {
                return NextResponse.redirect(new URL("/products/list", req.url));
            }

            // 管理者チェック
            if (pathname.startsWith("/dashboard") && user.admin !== true) {
                return NextResponse.redirect(new URL("/products/list", req.url));
            }
        } catch {
            if (isProtectedPath) {
                currentUrl.searchParams.set("reason", "session_expired");
                return NextResponse.redirect(currentUrl);
            }
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/products/:path*',
        '/users/:path*',
        '/dashboard/:path*',
        '/cart/:path*',
        '/((?!signup|api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
}
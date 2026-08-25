import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const publicPaths = ["/login", "/signup"];
    const protectedPath = ["/products", "/dashboard", "/users", "/cart"];

    const isPublicPath = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const isProtectedPath = protectedPath.some((p) => pathname === p || pathname.startsWith(`${p}/`));

    const authToken = req.cookies.get("auth_token")?.value;
    const currentUrl = new URL("/login", req.url);

    if (!authToken && isProtectedPath) {
        currentUrl.searchParams.set("reason", "session_expired");
        return NextResponse.redirect(currentUrl);
    }

    if (authToken) {
        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(authToken, secret);

            if (isPublicPath) {
                return NextResponse.redirect(new URL("/products/list", req.url));
            }

            // 管理者チェック
            if (pathname.startsWith("/dashboard") && payload.admin !== true) {
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
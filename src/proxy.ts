import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function proxy(req: NextRequest) {

    const authToken = req.cookies.get("auth_token")?.value;
    const loginUrl = new URL('/login', req.url);
    const currentUrl = new URL('/products/list', req.url);

    if (!authToken) {
        if (!req.nextUrl.pathname.includes("/login")) {
            return NextResponse.redirect(loginUrl);
        }
    } else {
        try {
            // jwtの署名の検証
            const encode = new TextEncoder().encode(JWT_SECRET);
            const result = await jwtVerify(authToken, encode);

            // ログインしているのにログイン画面に遷移している場合
            if (req.nextUrl.pathname.includes("/login") || req.nextUrl.pathname.includes("/signup")) {
                // 商品画面に自動的に遷移させる
                return NextResponse.redirect(currentUrl);
            }
        } catch (error) {
            console.log("エラー内容：", error);
            return NextResponse.redirect(loginUrl);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/products/:path*',
        '/users/:path*',
        '/dashboard/:path*',
        '/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
}
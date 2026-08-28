import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

// Cookieの設定
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600
    });
}

// Cookieの取得
export async function getAuthCookie() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
}

// Cookieの削除
export async function deleteAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
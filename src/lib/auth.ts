import { cookies } from "next/headers"
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET;

interface UserInfo {
    id: number;
    username: string;
    admin: boolean;
}

export async function getCurrentUser() {

    // ユーザ情報取得(cookieからjwt認証)
    const cookie = await cookies();
    const token = cookie.get("auth_token")?.value;
    try {
        if (token) {
            // JWTトークンの検証
            const secret = new TextEncoder().encode(JWT_SECRET);
            const { payload } = await jwtVerify(token!, secret);
            return { id: payload.id, username: payload.username, admin: payload.admin } as UserInfo;
        } else {
            return null;
        }
    } catch (error) {
        console.log("エラー内容：", error);
        return null;
    }
}
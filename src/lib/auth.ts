import { cookies } from "next/headers"
import jwt from 'jsonwebtoken'

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
            const decoded = jwt.verify(token!, JWT_SECRET!) as UserInfo;
            const { id, username, admin } = decoded;
            return { id, username, admin };
        } else {
            return null;
        }
    } catch (error) {
        console.log("エラー内容：", error);
        return null;
    }
}
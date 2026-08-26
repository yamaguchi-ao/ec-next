import { cookies } from "next/headers"
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET;

export interface UserInfo {
    id: number;
    username: string;
    admin: boolean;
}

export async function getCurrentUser(): Promise<UserInfo | null> {

    // ユーザ情報取得(cookieからjwt認証)
    const cookie = await cookies();
    const token = cookie.get("auth_token")?.value;

    if (!token) return null;

    try {
        if (!JWT_SECRET) {
            console.log("JWT_SECRETの設定が出来ていません。");
            return null;
        }
        
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token!, secret);

        return {
            id: Number(payload.id),
            username: String(payload.username),
            admin: Boolean(payload.admin)
        }
    } catch (error) {
        console.log("エラー内容：", error);
        return null;
    }
}

export async function requireUser(): Promise<UserInfo> {
    const user = await getCurrentUser();
    if (!user) {
        throw Error("認証が必要です。");
    }
    return user;
}

export async function requireAdmin(): Promise<UserInfo> {
    const user = await requireUser();
    if (!user.admin) {
        throw Error("管理者権限が必要です。");
    }
    return user;
}
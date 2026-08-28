import { SignJWT, jwtVerify } from 'jose'
import { deleteAuthCookie, getAuthCookie } from "./cookie";

export interface UserInfo {
    id: number;
    username: string;
    admin: boolean;
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw Error("secretの設定が出来ていません。");
}

// secretのエンコード
const secret = new TextEncoder().encode(jwtSecret);

// JWTのトークン作成
export async function createToken({ id, username, admin }: UserInfo) {
    return await new SignJWT({ id, username, admin })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
}

/** JWT検証 */
export async function getCurrentUser(): Promise<UserInfo | null> {

    // cookieから登録したtokenを取得
    const token = await getAuthCookie();

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

        if (
            typeof payload.id !== "number" ||
            typeof payload.username !== "string" ||
            typeof payload.admin !== "boolean"
        ) {
            throw new Error("JWT payloadが不正です。");
        }

        return {
            id: payload.id,
            username: payload.username,
            admin: payload.admin
        }
    } catch (error) {
        console.log("エラー内容：", error);
        await deleteAuthCookie();
        return null;
    }
}

/** 一般ユーザー検証 */
export async function requireUser(): Promise<UserInfo> {
    const user = await getCurrentUser();
    if (!user) {
        throw Error("認証が必要です。");
    }
    return user;
}

/** 管理者ユーザー検証 */
export async function requireAdmin(): Promise<UserInfo> {
    const user = await requireUser();
    if (!user.admin) {
        throw Error("管理者権限が必要です。");
    }
    return user;
}
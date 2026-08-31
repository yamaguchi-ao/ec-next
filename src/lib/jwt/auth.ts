import { SignJWT, jwtVerify } from 'jose'
import { deleteAuthCookie, getAuthCookie } from "./cookie";
import { UserType } from '@/types/types';
import prisma from '../prisma';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw Error("secretの設定が出来ていません。");
}

// secretのエンコード
const secret = new TextEncoder().encode(jwtSecret);

// JWTのトークン作成
export async function createToken({ id, username, admin }: UserType) {
    return await new SignJWT({ id, username, admin })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(secret);
}

/** JWT検証 */
export async function getCurrentUser(): Promise<UserType | null> {

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

        const address = await prisma.address.findFirst({
            where: { user_id: payload.id },
            select: {
                post_code: true,
                address1: true,
                address2: true,
                phone: true
            }
        });

        return {
            id: payload.id,
            username: payload.username,
            admin: payload.admin,
            address: {
                postCode: address?.post_code ?? "",
                address1: address?.address1 ?? "",
                address2: address?.address2 ?? "",
                phone: address?.phone ?? "",
            }
        }
    } catch (error) {
        console.log("エラー内容：", error);
        await deleteAuthCookie();
        return null;
    }
}

/** 一般ユーザー検証 */
export async function requireUser(): Promise<UserType> {
    const user = await getCurrentUser();

    if (!user) {
        throw Error("認証が必要です。");
    }
    return user;
}

/** 管理者ユーザー検証 */
export async function requireAdmin(): Promise<UserType> {
    const user = await requireUser();
    if (!user.admin) {
        throw Error("管理者権限が必要です。");
    }
    return user;
}
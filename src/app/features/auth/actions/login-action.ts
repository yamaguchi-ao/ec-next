"use server"

import z from "zod"
import prisma from "@/lib/prisma"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"


// パスワード桁数下限
const MIN_DIGIT = 8;

const schema = z.object({
    email: z.email("有効なメールアドレスで入力してください。").min(1, "メールアドレスを入力してください").trim(),
    password: z.string().min(MIN_DIGIT, { message: "8桁以上入力して下さい。" }).trim(),
});

const JWT_SECRET = process.env.JWT_SECRET;
const production = process.env.NODE_ENV === "production";

export type formState = {
    success: boolean,
    message: string,
    fieldErrors?: z.infer<typeof schema>
}

export async function loginAction(_prevState: formState, formData: FormData, adminFlg: boolean) {

    const cookie = await cookies();
    const hasToken = cookie.has("auth_token");

    if (hasToken) {
        // ログイン済みとする
        return { success: true, message: 'ログイン済みです。' }
    }

    const loginData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const issues = schema.safeParse(loginData);

    // バリデーションチェック
    if (!issues.success) {
        const validation = z.flattenError(issues.error);
        return { success: false, message: '', fieldErrors: validation.fieldErrors }
    } else {
        try {
            // ユーザー取得
            const user = await prisma.users.findUnique({
                where: { email: loginData.email }
            });

            if (!user) {
                // ユーザーが取得できなかった場合
                return { success: false, message: 'ユーザーが存在しません。' }
            }

            // 管理者か一般か
            if (!user.admin && adminFlg) {
                return { success: false, message: '管理者ユーザーではありません。' }
            } else if (user.admin && !adminFlg) {
                return { success: false, message: '一般ユーザーではありません。' }
            }

            // 取得したパスワードの確認
            const passMatch = await bcrypt.compare(loginData.password, user.password);

            if (passMatch) {
                if (JWT_SECRET) {
                    const token = jwt.sign({
                        id: user.id,
                        username: user.username,
                        admin: user.admin
                    }, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

                    // cookieにJWTを登録しておく
                    cookie.set("auth_token", token, {
                        httpOnly: true,
                        secure: production ? true : false,
                        sameSite: "strict",
                        maxAge: 3600
                    });
                } else {
                    console.log("JWT_SECRETが設定されていません。");
                    return { success: false, message: 'ログインに失敗しました。' };
                }

                // cookieにセットする
                if (adminFlg) {
                    revalidatePath("/dashboard");
                } else {
                    revalidatePath("/products");
                }
                return { success: true, message: 'ログインしました。' }
            } else {
                return { success: false, message: 'ユーザー名または、パスワードが違います。' }
            }

        } catch (e) {
            console.log("エラー：", e);
            return { success: false, message: 'エラーが発生しました。' }
        }
    }
}
"use server"

import z from "zod"
import prisma from "@/lib/prisma"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers"

// 新規登録用定数
const MIN_DIGIT = 8;
// jwtトークン
const JWT_SECRET = process.env.JWT_SECRET;

const schema = z.object({
    username: z.string().min(1, { message: "ユーザーネームを入力してください" }),
    email: z.email("有効なメールアドレスで入力してください。").min(1, "メールアドレスを入力してください"),
    password: z.string().min(MIN_DIGIT, { message: "8桁以上入力して下さい。" }),
    confirm: z.string().min(1, "パスワード再確認を入力してください。"),
}).refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "パスワードが異なっています。"
})

export type formState = {
    success: boolean,
    message: string,
    fieldErrors?: z.infer<typeof schema>
}

export async function SignupAction(_prevState: formState, formData: FormData) {

    const cookie = await cookies();

    const userData = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirm: formData.get("confirm") as string,
    }

    const issues = schema.safeParse(userData);

    // バリデーションチェック
    if (!issues.success) {
        const validation = z.flattenError(issues.error);
        return { success: false, message: '', fieldErrors: validation.fieldErrors }
    } else {
        try {
            const existEmail = await prisma.users.findUnique({
                where: { email: userData.email }
            });

            if (existEmail) {
                return { success: false, message: 'このメールアドレスは既に使用されています。' };
            } else {
                // パスワードをハッシュ化
                const hashedPassword = await bcrypt.hash(userData.password, 10);

                // ユーザーの新規登録
                const user = await prisma.users.create({
                    data: {
                        username: userData.username,
                        email: userData.email,
                        password: hashedPassword
                    }
                });

                if (JWT_SECRET) {
                    const token = jwt.sign({
                        id: user.id,
                        username: user.username,
                        admin: user.admin
                    }, JWT_SECRET, { algorithm: "HS256", expiresIn: "1h" });

                    // cookieにJWTを登録しておく
                    cookie.set("auth_token", token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "strict",
                        maxAge: 3600
                    });
                } else {
                    return { success: false, message: '設定が出来ていません。' };
                }
                return { success: true, message: '新規登録が完了しました。' };
            }
        } catch (e) {
            console.log("エラー：", e);
            return { success: false, message: 'エラーが発生しました。' }
        }
    }
}


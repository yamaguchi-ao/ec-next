"use server"
import { cookies } from "next/headers"

export async function logoutAction() {

    const cookie = await cookies();
    const hasToken = cookie.has("auth_token");

    try {

        if (hasToken) {
            cookie.delete("auth_token");
            return { success: true, message: 'ログアウトしました。' }
        } else {
            return { success: false, message: 'ログアウトに失敗しました。' }
        }

    } catch (error) {
        console.log("エラー内容：", error);
        return { success: false, message: 'ログアウトに失敗しました。' }
    }
}
"use server"
import { deleteAuthCookie, getAuthCookie } from "@/lib/jwt/cookie";

export async function logoutAction() {

    const token = await getAuthCookie();

    try {

        if (token) {
            await deleteAuthCookie();
            return { success: true, message: 'ログアウトしました。' }
        } else {
            return { success: false, message: 'ログアウトに失敗しました。' }
        }

    } catch (error) {
        console.log("エラー内容：", error);
        return { success: false, message: 'ログアウトに失敗しました。' }
    }
}
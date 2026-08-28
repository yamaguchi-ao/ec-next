"use server"

import bcrypt from "bcrypt"
import z from "zod"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { requireUser } from "@/lib/jwt/auth"

const addressSchema = z.object({
    postCode: z.string().trim().min(1, "郵便番号を入力してください。"),
    prefecture: z.string().trim().min(1, "都道府県を入力してください。"),
    apartment: z.string().trim(),
    phone: z.string().trim().min(1, "電話番号を入力してください。"),
})

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください。"),
    newPassword: z.string().min(8, "新しいパスワードは8桁以上入力してください。"),
    confirmPassword: z.string().min(1, "新しいパスワード（確認）を入力してください。"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "パスワードが一致していません。",
})

export type AccountFormState = {
    success: boolean
    message: string
    fieldErrors?: Record<string, string[] | undefined>
}

export async function updateAccount(_prevState: AccountFormState | null, formData: FormData): Promise<AccountFormState> {
    const data = {
        postCode: String(formData.get("postCode") ?? ""),
        prefecture: String(formData.get("prefecture") ?? ""),
        apartment: String(formData.get("apartment") ?? ""),
        phone: String(formData.get("phone") ?? ""),
    }
    const result = addressSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "", fieldErrors: z.flattenError(result.error).fieldErrors }
    }

    try {
        const user = await requireUser()
        const address = await prisma.address.findFirst({
            where: { user_id: user.id },
            orderBy: { created_at: "asc" },
        })

        if (address) {
            await prisma.address.update({
                where: { id: address.id },
                data: {
                    post_code: result.data.postCode,
                    address1: result.data.prefecture,
                    address2: result.data.apartment || null,
                    phone: result.data.phone,
                },
            })
        } else {
            await prisma.address.create({
                data: {
                    user_id: user.id,
                    post_code: result.data.postCode,
                    address1: result.data.prefecture,
                    address2: result.data.apartment || null,
                    phone: result.data.phone,
                },
            })
        }

        revalidatePath("/account")
        return { success: true, message: "アカウント情報を更新しました。" }
    } catch (error) {
        console.error("アカウント情報の更新に失敗しました。", error)
        return { success: false, message: "アカウント情報の更新に失敗しました。" }
    }
}

export async function changePassword(_prevState: AccountFormState | null, formData: FormData): Promise<AccountFormState> {
    const data = {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
    }
    const result = passwordSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "", fieldErrors: z.flattenError(result.error).fieldErrors }
    }

    try {
        const user = await requireUser()
        const record = await prisma.users.findUnique({
            where: { id: user.id },
            select: { password: true },
        })

        if (!record || !(await bcrypt.compare(result.data.currentPassword, record.password))) {
            return { success: false, message: "現在のパスワードが正しくありません。" }
        }

        await prisma.users.update({
            where: { id: user.id },
            data: { password: await bcrypt.hash(result.data.newPassword, 10) },
        })

        revalidatePath("/account/password")
        return { success: true, message: "パスワードを変更しました。" }
    } catch (error) {
        console.error("パスワードの変更に失敗しました。", error)
        return { success: false, message: "パスワードの変更に失敗しました。" }
    }
}

export async function getAddress() {
    try {
        const user = await requireUser();
        const address = await prisma.address.findFirst({
            where: { user_id: user.id },
            select: {
                post_code: true,
                address1: true,
                address2: true,
                phone: true
            }
        });

        return { success: true, data: address }
    } catch (e) {
        if (e instanceof Error) {
            console.log("エラー内容：", e.message);
            return { success: false, message: e.message ? e.message : "住所の取得に失敗しました。" }
        }
    }


}
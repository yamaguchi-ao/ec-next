"use server"

import bcrypt from "bcrypt"
import z from "zod"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { requireUser } from "@/lib/jwt/auth"
import { FormState } from "@/types/types"

const addressSchema = z.object({
    postCode: z.string().trim().min(1, "郵便番号を入力してください。"),
    address1: z.string().trim().min(1, "都道府県を入力してください。"),
    address2: z.string().trim(),
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


// アカウント情報の更新
export async function updateAccount(_prevState: FormState | null, formData: FormData): Promise<FormState> {
    const data = {
        postCode: String(formData.get("postCode") ?? ""),
        address1: String(formData.get("address1") ?? ""),
        address2: String(formData.get("address2") ?? ""),
        phone: String(formData.get("phone") ?? ""),
    }
    const result = addressSchema.safeParse(data)

    if (!result.success) {
        return { success: false, message: "", fieldErrors: z.flattenError(result.error).fieldErrors }
    }

    try {
        const user = await requireUser();

        const address = await prisma.address.findFirst({
            where: { user_id: user.id },
            orderBy: { created_at: "asc" },
        })

        if (address) {
            await prisma.address.update({
                where: { id: address.id },
                data: {
                    post_code: data.postCode,
                    address1: data.address1,
                    address2: data.address2 || null,
                    phone: data.phone,
                },
            })
        } else {
            await prisma.address.create({
                data: {
                    user_id: user.id,
                    post_code: data.postCode,
                    address1: data.address1,
                    address2: data.address2 || null,
                    phone: data.phone,
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

export async function changePassword(_prevState: FormState | null, formData: FormData): Promise<FormState> {
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
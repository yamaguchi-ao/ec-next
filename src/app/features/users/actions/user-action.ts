"use server"

import { getCurrentUser, requireAdmin } from "@/lib/jwt/auth";
import prisma from "@/lib/prisma";
import { findUser } from "@/lib/prisma/query";
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/types";

// 商品の取得
export async function getUsers(search: string, page?: number) {
    const limit = 10;
    const offset = (page! - 1) * limit;

    try {
        // 認証
        await requireAdmin();

        const whereConditions: Prisma.usersWhereInput = {}

        if (search) {
            whereConditions.AND = [
                {
                    OR: [
                        { username: { contains: search } },
                        { email: { contains: search } }
                    ],
                    admin: false
                }
            ]
        } else {
            whereConditions.admin = false
        }

        const products = await findUser({ whereInput: whereConditions, offset, limit });

        if (!products) {
            return { success: false, message: "ユーザーが存在しません。" }
        }
        // 全体データと全体の数
        const totalData = await prisma.users.count({ where: whereConditions });
        const totalPage = Math.ceil(totalData / limit);

        return { success: true, data: products, totalPage: totalPage, currentPage: Math.max(Number(page) || 1, 1) };

    } catch (e) {
        if (e instanceof Error) {
            console.log("エラー内容：", e.message);
            return { success: false, message: e.message ? e.message : "ユーザーの取得に失敗しました。" }
        }
    }
}

// ユーザー詳細取得
export async function getUser(id: number) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { success: false, message: "認証が必要です。" }
        }

        const product = await prisma.users.findUnique({
            where: { id: Number(id) },
        });

        if (!product) {
            return { success: false, message: "ユーザーが存在しません。" }
        }

        return { success: true, data: product };

    } catch (e) {
        if (e instanceof Error) {
            console.log("エラー内容：", e);
            return { success: false, message: e.message ? e.message : "ユーザーの取得に失敗しました。" }
        }
    }
}

// 商品の更新
export async function userUpdate(_prevState: FormState | null, formdata: FormData): Promise<FormState> {

    const updateData = {
        id: Number(formdata.get("id")),
        admin: formdata.get("admin") === "on",
    }

    try {
        // 認証
        await requireAdmin();
        await prisma.users.update({
            where: { id: updateData.id },
            data: {
                admin: updateData.admin
            }
        });

        return { success: true, message: "商品の更新をしました。" };
    } catch (e) {
        if (e instanceof Error) {
            console.log("エラー：", e.message);
            return { success: false, message: e.message ? e.message : "商品の更新に失敗しました。" };
        }
        return { success: false, message: "商品の更新に失敗しました。" };
    }
}

// 商品の削除
export async function userDelete(userId: number) {
    try {
        await requireAdmin();

        await prisma.users.delete({
            where: { id: Number(userId), admin: false }
        });

        return { success: true, message: "ユーザーを削除しました。" };
    } catch (e) {
        if (e instanceof Error) {
            console.log("エラー：", e.message);
            return { success: false, message: e.message ? e.message : "ユーザー削除に失敗しました。" };
        }
    }
}
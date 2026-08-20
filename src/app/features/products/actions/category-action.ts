import prisma from "@/lib/prisma";

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany();

        if (!categories) {
            return { success: false, message: "カテゴリーが存在しません。" }
        }

        return { success: true, data: categories };

    } catch (e) {
        console.log("エラー内容：", e);
        return { success: false, message: "カテゴリーの取得に失敗しました。" }
    }
}
"use server"

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import z from "zod"

const schema = z.object({
    name: z.string().min(1, "商品名を入力してください。"),
    selectCategory: z.string().min(1, "カテゴリーを選択してください。").nullish(),
    inputCategory: z.string().min(1, "カテゴリーを入力してください。").nullish(),
    price: z.number().min(1, "価格を入力してください。"),
    count: z.number().min(1, "入荷数を入力してください。"),
});

export type formState = {
    success: boolean,
    message: string,
    fieldErrors?: z.infer<typeof schema>
}

// 商品の取得
export async function getProducts(search: string, page?: number) {
    const limit = 10;
    const offset = (page! - 1) * limit;

    try {
        const whereConditions: Prisma.productsWhereInput = {}

        if (search) {
            whereConditions.name = { contains: search }
        }

        const products = await prisma.products.findMany({
            where: whereConditions,
            skip: offset,
            take: limit,
            select: {
                id: true,
                name: true,
                category: {
                    select: {
                        name: true
                    }
                },
                price: true,
                count: true,
                is_on_sale: true,
                created_at: true,
                updated_at: true
            }
        });

        if (!products) {
            return { success: false, message: "商品が存在しません。" }
        }
        // 全体データと全体の数
        const totalData = await prisma.products.count({ where: whereConditions });
        const totalPage = Math.ceil(totalData / limit);

        return { success: true, data: products, totalPage: totalPage, currentPage: page };

    } catch (e) {
        console.log("エラー内容：", e);
        return { success: false, message: "商品の取得に失敗しました。" }
    }
}

// 商品詳細取得
export async function getProduct(id: string) {
    try {
        const product = await prisma.products.findUnique({
            where: { id: id },
        });

        if (!product) {
            return { success: false, message: "商品が存在しません。" }
        }

        return { success: true, data: product };

    } catch (e) {
        console.log("エラー内容：", e);
        return { success: false, message: "商品の取得に失敗しました。" }
    }
}

// 商品の登録
export async function productRegister(_prevState: any, formdata: FormData) {

    const registData = {
        name: formdata?.get("name") as string,
        selectCategory: formdata?.get("selectCategory") as string,
        inputCategory: formdata?.get("inputCategory") as string,
        price: Number(formdata?.get("price")),
        count: Number(formdata?.get("count")),
        description: formdata?.get("description") as string,
    }

    const issue = schema.safeParse(registData);

    if (!issue.success) {
        const validation = z.flattenError(issue.error);
        return { success: false, message: "バリデーションエラー", fieldErrors: validation.fieldErrors }
    } else {
        try {
            // 既存商品の確認
            const product = await prisma.products.findFirst({
                where: { name: registData.name }
            });

            if (product) {
                return { success: false, message: "同一商品が存在します。" }
            } else {
                if (registData.inputCategory) {

                    const category = await prisma.category.findFirst({
                        where: { name: registData.inputCategory }
                    });
                    if (category) {
                        return { success: false, message: "同一カテゴリーが存在します。" }
                    }

                    // カテゴリーから商品を登録
                    await prisma.category.create({
                        data: {
                            name: registData.inputCategory,
                            products: {
                                create: {
                                    name: registData.name,
                                    price: registData.price,
                                    count: registData.count,
                                    description: registData.description ? registData.description : ""
                                }
                            }
                        }
                    });
                } else {
                    await prisma.products.create({
                        data: {
                            name: registData.name,
                            price: registData.price,
                            count: registData.count,
                            categoryId: registData.selectCategory,
                            description: registData.description ? registData.description : ""
                        }
                    })
                }
            }
            return { success: true, message: "商品を登録しました。" }
        } catch (e) {
            console.log("エラー内容：", e);
            return { success: false, message: "商品登録に失敗しました。" }
        }
    }
}

// 商品の更新
export async function productUpdate(_prevState: any, formdata: FormData, id: string) {
    const updateData = {
        name: formdata.get("name") as string,
        category: formdata.get("category") as string,
        price: Number(formdata.get("price")),
        count: Number(formdata.get("count")),
        status: Boolean(formdata.get("status")),
        description: formdata.get("description") as string,
    }

    const issue = schema.safeParse(updateData);

    if (!issue.success) {
        const validation = z.flattenError(issue.error);
        return { success: false, message: "商品の更新に失敗しました。", fieldErrors: validation.fieldErrors };
    } else {
        try {
            await prisma.products.update({
                where: { id: id },
                data: {
                    name: updateData.name,
                    categoryId: updateData.category,
                    price: updateData.price,
                    count: updateData.count,
                    is_on_sale: updateData.status,
                    description: updateData.description
                }
            });

            return { success: true, message: "商品の更新をしました。" };
        } catch (e) {
            console.log("エラー：", e);
            return { success: false, message: "商品の更新に失敗しました。" };
        }
    }
}

// 商品の削除
export async function productDelete(productId: string) {
    try {
        await prisma.products.delete({
            where: { id: productId }
        });
        return { success: true, message: "商品を削除しました。" };
    } catch (e) {
        console.log("エラー：", e);
        return { success: false, message: "商品の削除に失敗しました。" };
    }
}
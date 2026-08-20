"use server"

import prisma from "@/lib/prisma";
import { findProduct } from "@/lib/prisma/query";
import { Prisma } from "@prisma/client";

// 商品の取得
export async function getProductsList(search: string, page?: number) {
    
    const limit = 10;
    const offset = (page! - 1) * limit;

    try {
        const whereConditions: Prisma.productsWhereInput = {}
        whereConditions.AND = [
            {
                OR: [
                    {
                        name: {
                            contains: search
                        }
                    },
                    {
                        category: {
                            name: {
                                contains: search
                            }
                        }
                    },
                ],
                is_on_sale: true
            }
        ]

        const products = await findProduct({ whereInput: whereConditions, offset, limit });

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
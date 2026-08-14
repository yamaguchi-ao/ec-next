import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// 取得
export async function GET({ params }: { params: { name: string } }) {
    const whereConditions: Prisma.productsWhereInput = {}

    if (params) {
        whereConditions.name = { contains: params.name };
    }

    try {
        const data = await prisma.products.findMany({
            where: whereConditions,
            select: {
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

        if (!data) {
            return NextResponse.json({message: "商品が見つかりませんでした。"}, { status: 404 });
        }
        return NextResponse.json(data, {})
    } catch (e) {
        console.log("エラー：", e);
        return NextResponse.json({message: "サーバーエラーが発生しました。"}, { status: 500 });
    }
}

// 送信
export async function POST(req: NextRequest) {

}
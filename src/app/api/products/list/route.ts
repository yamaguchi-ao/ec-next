import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { findProduct } from "@/lib/prisma/query";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// 商品検索
export async function GET(req: NextRequest) {
    const user = await getCurrentUser();

    // cookie認証
    if (!user) {
        return NextResponse.json({ message: "認証に失敗しました。", }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get("name");
    const category = searchParams.get("category");
    const page = Number(searchParams.get("page"));

    const limit = 10;
    const offset = (page - 1) * limit;

    const whereConditions: Prisma.productsWhereInput = {};

    if (name || category) {
        whereConditions.AND = [
            {
                name: {
                    contains: name ?? ""
                },
                category: {
                    name: {
                        contains: category ?? ""
                    }
                },
                is_on_sale: true
            }
        ]
    } else {
        whereConditions.is_on_sale = true;
    }

    try {
        const data = await findProduct({ whereInput: whereConditions, offset: offset, limit: limit });

        // 全体データと全体の数
        const totalData = await prisma.products.count({ where: whereConditions });
        const totalPage = Math.ceil(totalData / limit);

        if (!data) {
            return NextResponse.json({ message: "商品が見つかりませんでした。" }, { status: 404 });
        }
        return NextResponse.json({ data, totalPage, page }, { status: 200 });
    } catch (e) {
        console.log("エラー：", e);
        return NextResponse.json({ message: "サーバーエラーが発生しました。" }, { status: 500 });
    }
}
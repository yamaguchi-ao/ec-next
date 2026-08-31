import { Prisma } from "@prisma/client";
import prisma from "../prisma";

type FindProp<T> = {
    whereInput?: T,
    offset?: number,
    limit?: number
}

// 商品の共通取得
export async function findProduct({ whereInput, offset, limit }: FindProp<Prisma.productsWhereInput>) {
    return await prisma.products.findMany({
        where: whereInput,
        skip: offset ? offset : undefined,
        take: limit ? limit : undefined,
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
}

export async function findUser({ whereInput, offset, limit }: FindProp<Prisma.usersWhereInput>) {

    return await prisma.users.findMany({
        where: whereInput,
        skip: offset ? offset : undefined,
        take: limit ? limit : undefined,
    })

}
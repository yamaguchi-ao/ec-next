"use server"

import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

// カート取得
export async function getCart() {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: "認証されていません。" }
    }

    try {

        const items = await prisma.cart.findUnique({
            where: { user_id: user.id },
            select: {
                items: {
                    select: {
                        id: true,
                        quantity: true,
                        products: {
                            select: {
                                name: true,
                                price: true,
                            }
                        }
                    }
                }
            }
        });

        return { success: true, data: items }
    } catch (e) {
        console.log("エラー", e);
        return { success: false, message: "カートの取得に失敗しました。" }
    }
}

// カート登録
export async function cartUpsert(_prevState: any, formData: FormData) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: false, message: "認証されていません。" };
    }

    const items = {
        productId: formData.get("productId") as string,
        quantity: Number(formData.get("quantity")),
        isIncrement: formData.get("isIncrement") === "true"
    }

    const increment = items.isIncrement ? 1 : items.quantity;

    try {
        await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.upsert({
                where: { user_id: user.id },
                create: { user_id: user.id },
                update: {}
            });

            await tx.cart_items.upsert({
                where: {
                    cart_id_product_id: {
                        cart_id: cart.id,
                        product_id: items.productId
                    },
                },
                create: {
                    cart_id: cart.id,
                    product_id: items.productId,
                    quantity: increment
                },
                update: {
                    quantity: {
                        increment: increment
                    }
                }
            });
        });
        return { success: true, message: "商品をカートに入れました。" }
    } catch (e) {
        console.log("エラー", e);
        return { success: false, message: "カートの登録に失敗しました。" }
    }
}

export async function deleteCartItem(cartItemid: string) {
    const user = await getCurrentUser();

    if (!user) {
        return { success: true, message: "認証されていません。" }
    }

    try {
        await prisma.cart_items.delete({
            where: { id: cartItemid }
        })
        return { success: true, message: "カートから商品を削除しました。" }
    } catch (e) {
        console.log("エラー", e);
        return { success: false, message: "カートから商品の削除に失敗しました。" }
    }
}
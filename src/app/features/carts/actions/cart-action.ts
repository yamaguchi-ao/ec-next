"use server"

import { requireUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import z from "zod";

const schema = z.object({
    quantity: z.number().int("整数を設定してください。").positive("1以上の個数を設定してください。")
});

export type formState = {
    success: boolean,
    message: string,
    fieldErrors?: z.infer<typeof schema>
}

// カート取得
export async function getCart() {
    try {
        // 認証
        const user = await requireUser();

        const cart = await prisma.cart.findUnique({
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
                                count: true,
                                is_on_sale: true
                            }
                        }
                    }
                }
            }
        });

        return { success: true, data: cart }
    } catch (e) {
        console.log("エラー", e);
        return { success: false, message: "カートの取得に失敗しました。" }
    }
}

// カート登録
export async function cartUpsert(_prevState: unknown, formData: FormData) {

    const items = {
        productId: formData.get("productId") as string,
        quantity: Number(formData.get("quantity")) || 1,
    }

    const issue = schema.safeParse(items);

    if (!issue.success) {
        const validation = z.flattenError(issue.error);
        return { success: false, message: "バリデーションエラー", fieldErrors: validation.fieldErrors }
    } else {
        try {
            // 認証
            const user = await requireUser();
            await prisma.$transaction(async (tx) => {
                const cart = await tx.cart.upsert({
                    where: { user_id: user.id },
                    create: { user_id: user.id },
                    update: {}
                });

                const product = await tx.products.findUnique({
                    where: { id: items.productId },
                    select: {
                        count: true,
                        is_on_sale: true
                    }
                });

                if (!product) {
                    throw Error("商品が見つかりませんでした。");
                }

                if (!product.is_on_sale) {
                    throw Error("販売停止中です。");
                }

                const existingItem = await tx.cart_items.findUnique({
                    where: {
                        cart_id_product_id: {
                            cart_id: cart.id,
                            product_id: items.productId
                        }
                    }
                });

                const nextQuantity = (existingItem?.quantity ?? 0) + items.quantity;
                if (product.count < nextQuantity) {
                    throw Error(`在庫が不足しています。\n残り${product.count}個です。`);
                }

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
                        quantity: nextQuantity
                    },
                    update: {
                        quantity: {
                            increment: items.quantity
                        }
                    }
                });
            });
            return { success: true, message: "商品をカートに入れました。" }
        } catch (e) {
            if (e instanceof Error) {
                console.log("エラー：", e.message);
                return { success: false, message: e.message ? e.message : "カートの登録に失敗しました。" }
            }
        }
    }
}

// 削除処理
export async function deleteCartItem(cartItemid: string) {
    try {
        // 認証
        const user = await requireUser();
        await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findUnique({
                where: { user_id: user.id },
                select: {
                    id: true
                }
            });

            if (!cart) {
                throw Error("カートが見つかりませんでした。");
            }

            const cartItem = await tx.cart_items.findFirst({
                where: { id: cartItemid, cart_id: cart.id }
            })

            if (!cartItem) {
                throw Error("商品が存在しません。");
            }

            await tx.cart_items.delete({
                where: { id: cartItemid }
            })
        });

        return { success: true, message: "カートから商品を削除しました。" }
    } catch (e) {
        if (e instanceof Error) {
            console.log("エラー", e.message);
            return { success: false, message: e.message ? e.message : "カートから商品の削除に失敗しました。" }
        }
    }
}
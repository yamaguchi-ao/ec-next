"use client"

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { category, products } from "@prisma/client";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { cartUpsert } from "@/app/features/carts/actions/cart-action";

interface detailsProp {
    data: products
    categories: category[]
}

export default function ProductListDetailsForm({ data, categories }: detailsProp) {
    const router = useRouter();

    // 商品ID取得
    const productId = data.id;

    // カテゴリー取得
    const matchedCategory = categories.find((item) => data.categoryId === item.id);

    // 数量指定用
    const maxQuantity = data.count > 0 ? data.count : 1;
    const [quantity, setQuantity] = useState(1);

    // 数量増減
    const handleQuantityChange = (change: number) => {
        setQuantity((prev) => Math.min(maxQuantity, Math.max(1, prev + change)));
    };

    const [state, addCartAction] = useActionState(cartUpsert, null);

    useEffect(() => {
        if (!state) {
            return;
        }

        toast.add({
            type: state.success ? "success" : "error",
            description: (
                <span className="whitespace-pre-line">
                    {state.message.replace(/\\n/g, "\n")}
                </span>
            )
        });

        if (state.success) {
            router.push("/products/list");
        }
    }, [state, router])

    return (
        <>
            <div className="flex w-full h-[calc(100vh-4rem)] bg-muted">
                <div className="flex flex-col w-full h-full p-5">
                    <Card className="w-full h-full">
                        <CardHeader>
                            <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                    <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => router.back()}></ChevronLeft>
                                    <CardTitle className="text-3xl">商品詳細</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardDescription className="px-6">
                            <CardContent>
                                <div className="flex gap-5">
                                    <div className="flex flex-col gap-5">
                                        <div className="bg-muted h-[calc(100vh-18rem)] w-[calc(100vh-18rem)]"></div>
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <form action={addCartAction}>
                                            <Input type="hidden" name="productId" value={productId}></Input>
                                            <Label className="text-3xl">{data.name}</Label>

                                            <div className="flex gap-1">
                                                <Label> カテゴリー：</Label>
                                                <Label className="text-2xl">{matchedCategory?.name}</Label>
                                            </div>

                                            <div className="flex gap-1">
                                                <Label> 在庫：</Label>
                                                <Label className="text-[18px]">{data.count > 0 ? `残り${data.count}点` : "売り切れ中"}</Label>
                                            </div>

                                            <div className="grid gap-3 py-3">
                                                <Label className="text-[18px]">商品説明</Label>
                                                <Label className="">{data.description ? data.description : "特になし"}</Label>
                                            </div>
                                            <div className="flex justify-end items-end py-3">
                                                <Label className="text-[20px]">価格(税込)</Label>
                                                <p className="text-[22px] pl-2 pr-1">¥</p>
                                                <Label className="text-4xl">{data.price.toLocaleString()}</Label>
                                            </div>
                                            {!data.is_on_sale ? (
                                                <div className="h-full rounded-xl p-8 text-center text-slate-500">
                                                    SOLD OUT
                                                </div>
                                            ) : (
                                                <div className="flex justify-end items-center gap-3 py-3">
                                                    <div className="flex items-center gap-2 rounded-md border bg-background">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-r-none border-0"
                                                            onClick={() => handleQuantityChange(-1)}
                                                            disabled={quantity <= 1}
                                                            aria-label="数量を減らす"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            name="quantity"
                                                            min={1}
                                                            max={maxQuantity}
                                                            value={quantity}
                                                            onChange={(e) => {
                                                                const nextValue = Number(e.target.value) || 1;
                                                                setQuantity(Math.min(maxQuantity, Math.max(1, nextValue)));
                                                            }}
                                                            className="h-10 w-16 border-0 bg-transparent text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            aria-label="数量"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-l-none border-0"
                                                            onClick={() => handleQuantityChange(1)}
                                                            disabled={quantity >= maxQuantity}
                                                            aria-label="数量を増やす"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <Button type="submit">カートに入れる</Button>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            </CardContent>
                        </CardDescription>
                    </Card>
                </div>
            </div>
        </>
    );
}
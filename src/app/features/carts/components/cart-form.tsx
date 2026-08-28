"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCartItem } from "../actions/cart-action";
import { toast } from "@/components/ui/toast";
import { useCartCount } from "@/components/providers/cart-count-provider";

type CartFormProps = {
    items: {
        id: string,
        products: {
            name: string;
            price: number;
            count: number;
        };
        quantity: number;
    }[];
};

export default function CartForm({ items }: CartFormProps) {

    const router = useRouter();
    const { refreshCartCount } = useCartCount();

    const [quantities, setQuantities] = useState<Record<string, number>>(
        () => Object.fromEntries(items.map((item) => [item.id, item.quantity]))
    );

    const subtotal = items.reduce(
        (sum, item) => sum + item.products.price * (quantities[item.id] ?? item.quantity),
        0
    );
    const shippingFee = items.length > 0 ? 300 : 0;
    const total = subtotal + shippingFee;

    const handleDelete = async (cartItemId: string) => {
        const result = await deleteCartItem(cartItemId);
        if (result) {
            toast.add({
                type: result.success ? "success" : "error",
                description: (
                    <span className="whitespace-pre-line">
                        {result.message.replace(/\\n/g, "\n")}
                    </span>
                )
            });
            if (result.success) {
                await refreshCartCount();
                router.refresh();
            }
        }
    }

    return (
        <div className="flex w-full h-[calc(100vh-4rem)] bg-muted p-5">
            <Card className="w-full h-full">
                <CardHeader>
                    <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                            <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => router.back()}></ChevronLeft>
                            <CardTitle className="text-3xl">カート詳細</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <div className="flex">
                    <CardContent className="w-full">
                        {items.length === 0 ? (
                            <div className="flex justify-center rounded-xl p-8 items-center text-slate-500 h-[calc(100vh-27rem)] text-[28px]">
                                <p>カートは空です</p>
                            </div>
                        ) : (
                            <ScrollArea>
                                <div className="space-y-4 max-h-[calc(100vh-27rem)]">
                                    {items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
                                                {item ? (
                                                    // <img
                                                    //     src={"test"}
                                                    //     alt={"test"}
                                                    //     className="h-full w-full object-cover"
                                                    // />
                                                    <></>
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-base font-semibold text-slate-800">{item.products.name}</p>
                                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                                    <span>数量:</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-7"
                                                        disabled={(quantities[item.id] ?? item.quantity) <= 1}
                                                        onClick={() => setQuantities((current) => ({
                                                            ...current,
                                                            [item.id]: Math.max(1, (current[item.id] ?? item.quantity) - 1),
                                                        }))}
                                                        aria-label={`${item.products.name}の数量を減らす`}
                                                    >
                                                        −
                                                    </Button>
                                                    <span className="min-w-5 text-center">{quantities[item.id] ?? item.quantity}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-7"
                                                        disabled={(quantities[item.id] ?? item.quantity) >= item.products.count}
                                                        onClick={() => setQuantities((current) => ({
                                                            ...current,
                                                            [item.id]: Math.max(1, (current[item.id] ?? item.quantity) + 1),
                                                        }))}
                                                        aria-label={`${item.products.name}の数量を減らす`}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    {new Intl.NumberFormat("ja-JP", {
                                                        style: "currency",
                                                        currency: "JPY",
                                                        maximumFractionDigits: 0,
                                                    }).format(item.products.price * (quantities[item.id] ?? item.quantity))}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Intl.NumberFormat("ja-JP", {
                                                        style: "currency",
                                                        currency: "JPY",
                                                        maximumFractionDigits: 0,
                                                    }).format(item.products.price)}
                                                    / 個
                                                </p>
                                            </div>
                                            <Button type="button" variant="destructive" onClick={() => handleDelete(item.id)} >
                                                <Trash2 className="size-6" />
                                            </Button>

                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        <div className="mt-6 rounded-xl bg-slate-50 p-4">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>小計</span>
                                <span>
                                    {new Intl.NumberFormat("ja-JP", {
                                        style: "currency",
                                        currency: "JPY",
                                        maximumFractionDigits: 0,
                                    }).format(subtotal)}
                                </span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-slate-600">
                                <span>送料</span>
                                <span>
                                    {new Intl.NumberFormat("ja-JP", {
                                        style: "currency",
                                        currency: "JPY",
                                        maximumFractionDigits: 0,
                                    }).format(shippingFee)}
                                </span>
                            </div>
                            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
                                <span>合計</span>
                                <span>
                                    {new Intl.NumberFormat("ja-JP", {
                                        style: "currency",
                                        currency: "JPY",
                                        maximumFractionDigits: 0,
                                    }).format(total)}
                                </span>
                            </div>

                            <Button className="mt-6 w-full" size="lg" disabled={items.length === 0 ? true : false}>
                                購入する
                            </Button>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}

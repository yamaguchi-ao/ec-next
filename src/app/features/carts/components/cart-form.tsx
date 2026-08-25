"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteCartItem } from "../actions/cart-action";
import { toast } from "@/components/ui/toast";

type CartFormProps = {
    items: {
        id: string,
        products: {
            name: string;
            price: number;
        };
        quantity: number;
    }[];
};


export default function CartForm({ items }: CartFormProps) {
    const router = useRouter();

    const subtotal = items.reduce((sum, item) => sum + item.products.price * item.quantity, 0);
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
                            <div className="rounded-xl p-8 text-center text-slate-500">
                                カートは空です。
                            </div>
                        ) : (
                            <ScrollArea>
                                <div className="space-y-4 max-h-60">
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
                                                <p className="mt-1 text-sm text-slate-500">数量: {item.quantity}</p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    {new Intl.NumberFormat("ja-JP", {
                                                        style: "currency",
                                                        currency: "JPY",
                                                        maximumFractionDigits: 0,
                                                    }).format(item.products.price * item.quantity)}
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

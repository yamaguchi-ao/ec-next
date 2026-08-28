"use client"

// import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { users } from "@prisma/client";
import { ChevronLeft,  } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect,  } from "react";
import { toast } from "@/components/ui/toast";
import { cartUpsert } from "@/app/features/carts/actions/cart-action";
import { useCartCount } from "@/components/providers/cart-count-provider";

// interface detailsProp {
//     data?: users
// }

export default function UserDetailsForm() {
    const router = useRouter();
    const { refreshCartCount } = useCartCount();

    // ユーザID取得
    // const productId = data?.id;

    // 
    const [state, addCartAction] = useActionState(cartUpsert, null);

    useEffect(() => {
        if (!state) {
            return;
        }

        toast.add({
            type: state.success ? "success" : "error",
            description: state.fieldErrors ? state.fieldErrors.quantity : (
                <span className="whitespace-pre-line">
                    {state.message.replace(/\\n/g, "\n")}
                </span>
            )
        });

        if (state.success) {
            router.push("/products/list");
        }

        // カートの増減
        const effect = async () => {
            if (state.success) {
                await refreshCartCount();
            }
        }
        void effect();
    }, [state, router]);

    return (
        <>
            <div className="flex w-full h-[calc(100vh-4rem)] bg-muted">
                <div className="flex flex-col w-full h-full p-5">
                    <Card className="w-full h-full">
                        <CardHeader>
                            <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                    <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => router.back()}></ChevronLeft>
                                    <div>
                                        <CardTitle className="text-2xl">ユーザ詳細</CardTitle>
                                        <CardDescription className="mt-1">商品の詳細を確認したり、個数選択をしてカートへの追加が行えます。</CardDescription>
                                    </div>
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

                                            <Label className="text-3xl">ユーザ名：</Label>
                                            <Input name="name" value={""}></Input>

                                            <div className="flex gap-1">
                                                <Label> メールアドレス：</Label>
                                                <Input name="name" value={""}></Input>
                                            </div>

                                            <div className="flex gap-1">
                                                <Label> 郵便番号：</Label>
                                                <Input name="name" value={""}></Input>-<Input name="name" value={""}></Input>
                                            </div>

                                            <div className="grid gap-3 py-3">
                                                <Label className="text-[18px]">都道府県・市町村</Label>
                                                <Input name="name" value={""}></Input>
                                                <Label className="text-[18px]">アパート・マンション</Label>
                                                <Input name="name" value={""}></Input>
                                            </div>

                                            <div className="flex justify-end items-end py-3">
                                                <Label className="text-[20px]">電話番号：</Label>
                                                <Input name="name" value={""}></Input>
                                            </div>
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
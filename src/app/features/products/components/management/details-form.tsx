"use client"

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription, Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { category, products } from "@prisma/client";
import { ChevronLeft } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { productUpdate } from "../../actions/product-action";
import { toast } from "@/components/ui/toast";

interface detailsProp {
    data?: products
    categories: category[]
}

export default function ProductDetailsForm({ data, categories }: detailsProp) {
    const router = useRouter();

    // 商品ID取得
    const productId = data?.id;

    // 販売状態のステータス用
    const [status, setStatus] = useState(false);

    // カテゴリー用
    const [selectCategory, setSelectCategory] = useState<string | null>(null);

    useEffect(() => {
        setStatus(data?.is_on_sale ?? false);
        setSelectCategory(data?.categoryId ?? "");
    }, []);

    const [state, updateAction] = useActionState(
        async (prevState: unknown, formData: FormData) => {
            const result = await productUpdate(prevState, formData, productId ?? "");
            if (result?.fieldErrors) {
                return result?.fieldErrors
            } else {
                toast.add({
                    type: result?.success ? "success" : "error",
                    description: result?.message
                });
                if (result?.success) {
                    redirect("/products/management");
                }
            }
        }, null);

    // shadcn/uiのselectで必要
    const selectCategories = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    // バリデーションメッセージ表示
    const errorText = (data: string[]) => {
        const list = [];
        for (let i = 0; i < data.length; i++) {
            list.push(<p key={i} className="pt-1 text-[12px] text-red-600">{data[i]}</p>)
        }

        return list;
    }

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
                                <form className="flex gap-5" action={updateAction}>
                                    <div className="flex flex-col gap-5">
                                        <div className="bg-muted h-[calc(100vh-24rem)] w-[calc(100vh-24rem)]"></div>
                                        <Button>ファイル選択</Button>
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <div className="flex gap-3 py-3">
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="name">商品名<p className="text-red-500">*</p></Label>
                                                        <Input name="name" id="name" defaultValue={data?.name} />
                                                        <FieldError>{state?.name && errorText(state?.name)}</FieldError>
                                                    </div>
                                                </Field>
                                            </FieldGroup>
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="category">カテゴリー<p className="text-red-500">*</p></Label>
                                                        <Select name="category" id="category" items={selectCategories} value={selectCategory}
                                                            onValueChange={(value) => { setSelectCategory(value) }}>
                                                            <SelectTrigger className="w-full max-w-70">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectLabel>カテゴリー</SelectLabel>
                                                                    {categories.map((item) => (
                                                                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                        <FieldError>{state?.selectCategory && errorText(state?.selectCategory)}</FieldError>
                                                    </div>
                                                </Field>
                                            </FieldGroup>
                                        </div>
                                        <div className="flex gap-3 py-3">
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="price">価格<p className="text-red-500">*</p></Label>
                                                        <Input name="price" id="price" defaultValue={data?.price} />
                                                        <FieldError>{state?.price && errorText(state?.price)}</FieldError>
                                                    </div>
                                                </Field>
                                            </FieldGroup>
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="count">在庫数<p className="text-red-500">*</p></Label>
                                                        <Input name="count" id="count" defaultValue={data?.count} />
                                                        <FieldError>{state?.count && errorText(state?.count)}</FieldError>
                                                    </div>
                                                </Field>
                                            </FieldGroup>
                                        </div>
                                        <FieldGroup>
                                            <Field>
                                                <div className="grid gap-3 py-3">
                                                    <Label >販売状態<p className="text-red-500">*</p></Label>
                                                    <div className="flex gap-3">
                                                        <Switch name="status" id="status" checked={status} onCheckedChange={setStatus} />
                                                        <Label>{status ? "販売" : "販売停止"}</Label>
                                                    </div>
                                                </div>
                                            </Field>
                                        </FieldGroup>
                                        <FieldGroup>
                                            <Field>
                                                <div className="grid gap-3 py-3">
                                                    <Label htmlFor="description">商品説明<p className="text-[11px] text-black/40">※任意</p></Label>
                                                    <Textarea className="h-30 resize-none" name="description" id="description" defaultValue={data?.description ?? ""} onChange={(e) => e.target.value} />
                                                </div>
                                            </Field>
                                        </FieldGroup>
                                        <div className="flex justify-end items-center gap-3 py-3">
                                            <Button type="submit">更新</Button>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </CardDescription>
                    </Card>
                </div>
            </div>
        </>
    );
}
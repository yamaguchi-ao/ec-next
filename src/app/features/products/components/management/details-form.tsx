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
import { FormState } from "@/types/types";

interface detailsProp {
    data?: products
    categories: category[]
}

export default function ProductDetailsForm({ data, categories }: detailsProp) {
    const router = useRouter();

    if (!data) {
        toast.add({
            type: "error",
            description: "商品が見つかりませんでした。"
        });
        redirect("/products/management");
    }

    // 販売状態のステータス用
    const [status, setStatus] = useState(false);

    // カテゴリー用
    const [selectCategory, setSelectCategory] = useState<string | null>(null);

    const [state, updateAction] = useActionState<FormState | null, FormData>(
        productUpdate,
        null,
    );

    const [formData, setFormData] = useState({
        name: data?.name ?? "",
        price: data?.price ?? "",
        count: data?.count ?? "",
        description: data?.description
    });

    useEffect(() => {
        setStatus(data?.is_on_sale ?? false);
        setSelectCategory(data?.categoryId ?? "");
        setFormData(data);
        if (state) {
            toast.add({
                type: state.success ? "success" : "error",
                description: state.message,
            });

            if (state.success) {
                router.push("/products/management");
            }
        }
    }, [data, state, router]);

    // shadcn/uiのselectで必要
    const selectCategories = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    // バリデーションメッセージ表示
    const showError = (field: string) => {
        const errors = state?.fieldErrors?.[field]
        return errors?.map((error) => (
            <p key={error} className="text-xs text-red-600">{error}</p>
        ));
    }

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
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
                                    <div>
                                        <CardTitle className="text-2xl">商品詳細</CardTitle>
                                        <CardDescription className="mt-1">商品の編集を行い、価格やカテゴリー、在庫数などの商品情報を管理します。</CardDescription>
                                    </div>
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
                                    <Input type="hidden" name="id" value={data?.id} />
                                    <div className="flex flex-col w-full">
                                        <div className="flex gap-3 py-3">
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="name">商品名<p className="text-red-500">*</p></Label>
                                                        <Input name="name" id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                                                        <FieldError>{showError("name")}</FieldError>
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
                                                        <FieldError>{showError("category")}</FieldError>
                                                    </div>
                                                </Field>
                                            </FieldGroup>
                                        </div>
                                        <div className="flex gap-3 py-3">
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="price">価格<p className="text-red-500">*</p></Label>
                                                        <Input name="price" id="price" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} />
                                                        <FieldError>{showError("price")}</FieldError>
                                                    </div>
                                                </Field>
                                            </FieldGroup>
                                            <FieldGroup>
                                                <Field>
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="count">在庫数<p className="text-red-500">*</p></Label>
                                                        <Input name="count" id="count" value={formData.count} onChange={(e) => handleChange("count", e.target.value)} />
                                                        <FieldError>{showError("count")}</FieldError>
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
                                                    <Textarea className="h-30 resize-none" name="description" id="description" value={formData?.description ?? ""} onChange={(e) => handleChange("description", e.target.value)} />
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
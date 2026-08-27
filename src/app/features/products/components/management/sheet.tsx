"use client"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionState, useState } from "react";
import { productRegister } from "../../actions/product-action";
import { toast } from "@/components/ui/toast";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { categoriesData, changeOpen, isOpen } from "./management-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterSheet() {

    // 親が持つ表示状態の取得
    const open = isOpen();
    const setOpen = changeOpen();

    const categories = categoriesData();

    // shadcn/uiのselectで必要
    const selectCategories = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    const [select, setSelect] = useState("select");

    const [state, register, pending] = useActionState(
        async (prevState: unknown, formData: FormData) => {
            const result = await productRegister(prevState, formData);
            if (result?.fieldErrors) {
                setOpen(false);
                return result?.fieldErrors
            } else {
                setOpen(false);
                toast.add({
                    type: result?.success ? "success" : "error",
                    description: result?.message,
                });
            }
        }, null);

    // バリデーションメッセージ表示
    const errorText = (data: string[]) => {
        const list = [];
        for (let i = 0; i < data.length; i++) {
            list.push(<p key={i} className="pt-1 text-[12px] text-red-600">{data[i]}</p>)
        }

        return list;
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <div className="flex justify-center items-center">
                <SheetTrigger render={
                    <Button className="w-full h-10" type="button" variant="ghost">
                        <Plus className="size-6" />
                    </Button>
                } />
            </div>
            <SheetContent className="flex w-full flex-col sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="text-2xl">商品登録</SheetTitle>
                    <p className="text-sm text-muted-foreground">新しい商品情報を入力してください。</p>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-4">
                    <form id="product-form" action={register}>
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <p className="mb-3 text-sm font-semibold">基本情報</p>
                        <FieldGroup>
                            <Field>
                                <div className="grid gap-3 py-3">
                                    <Label htmlFor="name">商品名<p className="text-red-500">*</p></Label>
                                    <Input name="name" id="name" defaultValue="" disabled={pending} aria-invalid={!!state?.name} />
                                    <FieldError>{state?.name && errorText(state?.name)}</FieldError>
                                </div>
                            </Field>
                        </FieldGroup>
                        </div>
                        <RadioGroup value={select} onValueChange={setSelect}>
                            <div className="mb-2 rounded-lg border bg-muted/30 p-4">
                            <p className="mb-3 text-sm font-semibold">カテゴリー</p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="flex justify-center items-center gap-2">
                                    <RadioGroupItem value="select" id="select" />
                                    <Label htmlFor="select">既存カテゴリー選択</Label>
                                </div>
                                <div className="flex justify-center items-center gap-2">
                                    <RadioGroupItem value="register" id="register" />
                                    <Label htmlFor="register">新規カテゴリー登録</Label>
                                </div>
                            </div>
                            {select === "select" ?
                                <FieldGroup>
                                    <Field>
                                        <div className="grid gap-3 py-3">
                                            <Label htmlFor="">カテゴリー<p className="text-red-500">*</p></Label>
                                            <Select name="selectCategory" id="category" items={selectCategories} >
                                                <SelectTrigger className="w-full max-w-70" aria-invalid={!!state?.selectCategory}>
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
                                :
                                <FieldGroup>
                                    <Field>
                                        <div className="grid gap-3 py-3">
                                            <Label htmlFor="">カテゴリー<p className="text-red-500">*</p></Label>
                                            <Input name="inputCategory" id="category" defaultValue="" disabled={pending} aria-invalid={!!state?.inputCategory} />
                                            <FieldError>{state?.inputCategory && errorText(state?.inputCategory)}</FieldError>
                                        </div>
                                    </Field>
                                </FieldGroup>
                            }
                        </div>
                        </RadioGroup>
                        <div className="mt-4 grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
                        <FieldGroup>
                            <Field>
                                <div className="grid gap-3 py-3">
                                    <Label htmlFor="price">価格<p className="text-red-500">*</p></Label>
                                    <Input name="price" id="price" defaultValue="" disabled={pending} aria-invalid={!!state?.price} />
                                    <FieldError>{state?.price && errorText(state?.price)}</FieldError>
                                </div>
                            </Field>
                        </FieldGroup>

                        <FieldGroup>
                            <Field>
                                <div className="grid gap-3 py-3">
                                    <Label htmlFor="count">入荷数<p className="text-red-500">*</p></Label>
                                    <Input name="count" id="count" defaultValue="" disabled={pending} aria-invalid={!!state?.count} />
                                    <FieldError>{state?.count && errorText(state?.count)}</FieldError>
                                </div>
                            </Field>
                        </FieldGroup>
                        </div>

                        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                        <FieldGroup>
                            <Field>
                                <div className="grid gap-3 py-3">
                                    <Label htmlFor="description">商品説明<p className="text-[11px] text-black/40">※任意</p></Label>
                                    <Textarea className="h-30" name="description" id="description" defaultValue="" />
                                    {/* <FieldError>{state?.description && errorText(state?.description)}</FieldError> */}
                                </div>
                            </Field>
                        </FieldGroup>
                        </div>
                    </form>
                </div>
                <SheetFooter className="border-t bg-background">
                    <Button type="submit" form="product-form" disabled={pending}>商品登録</Button>
                    <SheetClose render={<Button variant="outline">閉じる</Button>} />
                </SheetFooter>
            </SheetContent>
        </Sheet >
    )
}
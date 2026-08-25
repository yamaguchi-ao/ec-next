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
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-2xl">商品登録</SheetTitle>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-scroll">
                    <form id="product-form" action={register}>
                        <FieldGroup>
                            <Field>
                                <div className="grid gap-3 py-3">
                                    <Label htmlFor="name">商品名<p className="text-red-500">*</p></Label>
                                    <Input name="name" id="name" defaultValue="" disabled={pending} aria-invalid={!!state?.name} />
                                    <FieldError>{state?.name && errorText(state?.name)}</FieldError>
                                </div>
                            </Field>
                        </FieldGroup>
                        <RadioGroup value={select} onValueChange={setSelect}>
                            <div className="flex gap-3 py-3">
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
                        </RadioGroup>
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

                        <FieldGroup>
                            <Field>
                                <div className="grid gap-3 py-3">
                                    <Label htmlFor="description">商品説明<p className="text-[11px] text-black/40">※任意</p></Label>
                                    <Textarea className="h-30" name="description" id="description" defaultValue="" />
                                    {/* <FieldError>{state?.description && errorText(state?.description)}</FieldError> */}
                                </div>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>
                <SheetFooter>
                    <Button type="submit" form="product-form">商品登録</Button>
                    <SheetClose render={<Button variant="outline">閉じる</Button>} />
                </SheetFooter>
            </SheetContent>
        </Sheet >
    )
}
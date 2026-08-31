"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { updateAccount } from "../actions/account-action"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Field, FieldError } from "@/components/ui/field"
import { FormState } from "@/types/types"

type AccountFormProps = {
    username: string
    address?: {
        postCode: string
        address1: string
        address2: string
        phone: string
    }
}

export default function AccountForm({ username, address }: AccountFormProps) {
    const router = useRouter();

    const [state, action, isPending] = useActionState<FormState | null, FormData>(
        updateAccount,
        null,
    );

    const [formData, setFormData] = useState({
        postCode: address?.postCode ?? "",
        address1: address?.address1 ?? "",
        address2: address?.address2 ?? "",
        phone: address?.phone ?? "",
    });

    const showError = (field: string) => {
        const errors = state?.fieldErrors?.[field]
        return errors?.map((error) => (
            <p key={error} className="text-xs text-red-600">{error}</p>
        ));
    }

    useEffect(() => {
        setFormData({
            postCode: address?.postCode ?? "",
            address1: address?.address1 ?? "",
            address2: address?.address2 ?? "",
            phone: address?.phone ?? "",
        });
        if (state?.success) {
            toast.add({ type: "success", description: state.message });
            router.push("/products/list");
        }
    }, [state]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <main className="h-[calc(100vh-4rem)] bg-muted p-5">
            <Card className="mx-auto w-full h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => router.back()}></ChevronLeft>
                        <div>
                            <CardTitle className="text-2xl">アカウント情報</CardTitle>
                            <CardDescription>お届け先や連絡先を登録・編集できます。</CardDescription>
                        </div>
                    </div>

                </CardHeader>
                <CardContent>
                    <form action={action} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="username">ユーザー名</Label>
                            <p id="username" className="rounded-md border bg-muted px-3 py-2">{username}</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Field className="grid gap-2">
                                <Label htmlFor="postCode">郵便番号</Label>
                                <Input id="postCode" name="postCode" placeholder="001-0000"
                                    value={formData.postCode} onChange={(e) => handleChange("postCode", e.target.value)} />
                                <FieldError>{showError("postCode")}</FieldError>
                            </Field>
                            <Field className="grid gap-2">
                                <Label htmlFor="address1">都道府県</Label>
                                <Input id="address1" name="address1" placeholder="東京都"
                                    value={formData.address1} onChange={(e) => handleChange("address1", e.target.value)} />
                                <FieldError>{showError("address1")}</FieldError>
                            </Field>
                        </div>
                        <Field className="grid gap-2">
                            <Label htmlFor="address2">アパート・マンション</Label>
                            <Input id="address2" name="address2" placeholder="千代田マンション 101号室"
                                value={formData.address2} onChange={(e) => handleChange("address2", e.target.value)} />
                        </Field>
                        <Field className="grid gap-2">
                            <Label htmlFor="phone">電話番号</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="090-0000-0000"
                                value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                            <FieldError>{showError("phone")}</FieldError>
                        </Field>
                        {state && !state.success && state.message && (
                            <p className="text-sm text-red-600">{state.message}</p>
                        )}
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "保存中..." : "保存する"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

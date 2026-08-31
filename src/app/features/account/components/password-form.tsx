"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { changePassword } from "../actions/account-action"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Field, FieldError } from "@/components/ui/field"
import { FormState } from "@/types/types"

export default function PasswordForm() {
    const router = useRouter();

    const [state, action, isPending] = useActionState<FormState | null, FormData>(
        changePassword,
        null,
    )

    const showError = (field: string) => {
        const errors = state?.fieldErrors?.[field]
        return errors?.map((error) => (
            <p key={error} className="text-xs text-red-600">{error}</p>
        ))
    }

    useEffect(() => {
        if (state?.success) {
            toast.add({ type: "success", description: state.message });
            router.push("/products/list");
        }
    }, [state])

    return (
        <main className="h-[calc(100vh-4rem)] bg-muted p-5">
            <Card className="mx-auto w-full h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => router.back()}></ChevronLeft>
                        <div>
                            <CardTitle className="text-2xl">パスワード変更</CardTitle>
                            <CardDescription>新しいパスワードを設定できます。</CardDescription>
                        </div>
                    </div>

                </CardHeader>
                <CardContent>
                    <form action={action} className="grid gap-6">
                        <Field className="grid gap-2">
                            <Label htmlFor="currentPassword">現在のパスワード</Label>
                            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" />
                            <FieldError>{showError("currentPassword")}</FieldError>
                        </Field>
                        <Field className="grid gap-2">
                            <Label htmlFor="postCode">新しいパスワード</Label>
                            <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" />
                            <FieldError>{showError("newPassword")}</FieldError>
                        </Field>
                        <Field className="grid gap-2">
                            <Label htmlFor="address1">新しいパスワード（確認）</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="confirm-password" />
                            <FieldError>{showError("confirmPassword")}</FieldError>
                        </Field>
                        {state && !state.success && state.message && (
                            <p className="text-sm text-red-600">{state.message}</p>
                        )}
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "更新中..." : "更新"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

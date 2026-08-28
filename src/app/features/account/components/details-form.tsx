"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { updateAccount, type AccountFormState } from "../actions/account-action"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

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

    const [state, action, isPending] = useActionState<AccountFormState | null, FormData>(
        updateAccount,
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
            toast.add({ type: "success", description: state.message })
        }
    }, [state])

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
                            <div className="grid gap-2">
                                <Label htmlFor="postCode">郵便番号</Label>
                                <Input id="postCode" name="postCode" placeholder="001-0000" defaultValue={address?.postCode} />
                                {showError("postCode")}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address1">都道府県</Label>
                                <Input id="address1" name="address1" placeholder="東京都" defaultValue={address?.address1} />
                                {showError("address1")}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address2">アパート・マンション</Label>
                            <Input id="address2" name="address2" placeholder="千代田マンション 101号室" defaultValue={address?.address2} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">電話番号</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="090-0000-0000" defaultValue={address?.phone} />
                            {showError("phone")}
                        </div>
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

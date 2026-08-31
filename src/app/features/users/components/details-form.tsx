"use client"

import { useActionState, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormState } from "@/types/types"
import { userUpdate } from "../actions/user-action"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

type UserProp = {
    id: number,
    username: string,
    admin?: boolean
}

export default function UserDetailsForm({ ...data }: UserProp) {
    const router = useRouter();

    const [state, action, isPending] = useActionState<FormState | null, FormData>(
        userUpdate,
        null,
    );

    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        setAdmin(data?.admin ?? false);
        if (state?.success) {
            toast.add({ type: "success", description: state.message });
            router.push("/products/list");
        }
    }, [state]);

    return (
        <main className="h-[calc(100vh-4rem)] bg-muted p-5">
            <Card className="mx-auto w-full h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => router.back()}></ChevronLeft>
                        <div>
                            <CardTitle className="text-2xl">ユーザー詳細</CardTitle>
                            <CardDescription>一般ユーザの管理者移行設定ができます。</CardDescription>
                        </div>
                    </div>

                </CardHeader>
                <CardContent>
                    <form action={action} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="username">ユーザー名</Label>
                            <p id="username" className="rounded-md border bg-muted px-3 py-2">{data.username}</p>
                        </div>
                        <Input type="hidden" name="id" value={data.id} />
                        <div className="grid gap-2">
                            <Label htmlFor="admin">管理者に変更</Label>
                            <div className="flex gap-3">
                                <Switch name="admin" id="admin" checked={admin} onCheckedChange={setAdmin} />
                            </div>
                        </div>
                        {state && !state.success && state.message && (
                            <p className="text-sm text-red-600">{state.message}</p>
                        )}
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "更新中..." : "更新する"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

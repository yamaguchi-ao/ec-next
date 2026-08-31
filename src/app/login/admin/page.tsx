import LoginForm from "@/app/features/auth/components/login-form";
import { Suspense } from "react";

export default function AdminLoginPage() {
    return (
        <>
            <title>管理者ログイン</title>
            <div className="flex w-full h-screen">
                <Suspense>
                    <LoginForm adminFlg={true} />
                </Suspense>
            </div>
        </>
    )
}
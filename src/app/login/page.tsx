import LoginForm from "@/app/features/auth/components/login-form";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <>
            <title>ログイン</title>
            <div className="flex w-full h-screen">
                <Suspense>
                    <LoginForm />
                </Suspense>
            </div>
        </>
    )
}
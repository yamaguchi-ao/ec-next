import LoginForm from "@/app/features/auth/components/login-form";

export default function LoginPage() {
    return (
        <>
            <title>ログイン</title>
            <div className="flex w-full h-screen">
                <LoginForm />
            </div>
        </>
    )
}
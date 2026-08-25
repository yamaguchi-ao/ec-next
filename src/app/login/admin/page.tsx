import LoginForm from "@/app/features/auth/components/login-form";

export default function AdminLoginPage() {
    return (
        <>
        <title>管理者ログイン</title>
            <div className="flex w-full h-screen">
                <LoginForm adminFlg={true}/>
            </div>
        </>
    )
}
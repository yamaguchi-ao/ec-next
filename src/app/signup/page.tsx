import SignupForm from "../features/auth/components/signup-form"

export default async function SignupPage() {

    return (
        <>
            <title>新規会員登録</title>
            <div className="flex w-full h-screen">
                {/* 新規登録フォーム 参照*/}
                <SignupForm />
            </div>
        </>
    )
}
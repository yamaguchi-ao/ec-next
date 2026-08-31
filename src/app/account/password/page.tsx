import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";
import PasswordForm from "../../features/account/components/password-form";

export default async function page() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    // 認証
    if (!user) redirect("/login");

    return (
        <>
            <title>パスワード変更</title>
            <Header id={user.id} username={user.username} admin={adminFlg} address={user.address} />
            <PasswordForm />
        </>
    );
}
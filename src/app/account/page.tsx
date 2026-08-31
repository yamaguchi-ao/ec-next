import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";
import AccountForm from "../features/account/components/details-form";

export default async function page() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    // 認証
    if (!user) redirect("/login");

    return (
        <>
            <title>アカウント情報</title>
            <Header id={user.id} username={user.username} admin={adminFlg} address={user.address} />
            <AccountForm username={user.username} address={user.address} />
        </>
    );
}
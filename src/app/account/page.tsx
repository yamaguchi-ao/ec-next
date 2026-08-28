import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";
import AccountForm from "../features/account/components/details-form";
import { getAddress } from "../features/account/actions/account-action";

export default async function page() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    // 認証
    if (!user) redirect("/login");

    const data = await getAddress();
    const address = data?.success && data.data
        ? {
            postCode: data.data.post_code,
            address1: data.data.address1,
            address2: data.data.address2 ?? "",
            phone: data.data.phone ?? "",
        }
        : undefined;
        
    return (
        <>
            <title>カート詳細</title>
            <Header username={user.username} admin={adminFlg} />
            <AccountForm username={user.username} address={address} />
        </>
    );
}
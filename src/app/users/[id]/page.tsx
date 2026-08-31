import { getUser } from "@/app/features/users/actions/user-action";
import UserDetailsForm from "@/app/features/users/components/details-form";
import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";

export default async function page({ params }: { params: Promise<{ id: number }> }) {
    const currentUser = await getCurrentUser();
    const adminFlg = currentUser?.admin;
    const id = (await params).id;

    // 認証
    if (!currentUser) redirect("/login");

    const userResult = await getUser(id);
    const user = userResult?.data;
    
    if (!user) {
        redirect("/users");
    }

    return (
        <>
            <title>ユーザー詳細</title>
            <Header id={currentUser.id} username={currentUser.username} admin={adminFlg} />
            <UserDetailsForm id={user.id} username={user.username} admin={user.admin} />
        </>
    );
}
import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";
import UserForm from "../features/users/components/list-form";


export default async function UserManagementPage() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    if (!user) {
        redirect("/login");
    }

    if (!adminFlg) {
        redirect("/products/list");
    }

    return (
        <>
            <title>商品管理</title>
            <Header id={user.id} username={user.username!} admin={adminFlg} />
            <UserForm />
        </>
    );
}
import Header from "@/components/layout/header";
import DashBoardForm from "../features/dashboard/components/dashboard-form";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";

export default async function DashBoardPage() {
    const user = await getCurrentUser();

    // 認証
    if (!user) redirect("/login");

    // 一般確認
    if (!user.admin) redirect("/products/list");

    return (
        <>
            <title>ダッシュボード</title>
            <Header id={user.id} username={user.username} admin={user.admin} />
            <DashBoardForm />
        </>
    )
}

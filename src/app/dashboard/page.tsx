import Header from "@/components/layout/header";
import DashBoardForm from "../features/dashboard/components/dashboard-form";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashBoardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <>
            <title>ダッシュボード</title>
            <Header username={user.username} admin={user.admin} />
            <DashBoardForm />
        </>
    )
}

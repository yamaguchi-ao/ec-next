import Header from "@/components/layout/header";
import DashBoardForm from "../features/dashboard/components/dashboard-form";
import { getCurrentUser } from "@/lib/auth";

export default async function DashBoardPage() {
    const user = await getCurrentUser();

    return (
        <>
            <title>ダッシュボード</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <DashBoardForm />
        </>
    )
}

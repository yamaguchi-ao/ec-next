import { signaturesAction } from "@/app/features/actions/signatures-action";
import Header from "@/components/layout/header";
import DashBoardForm from "../features/dashboard/components/dashboard-form";

export default async function DashBoardPage() {
    const user = await signaturesAction();

    return (
        <>
            <title>ダッシュボード</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <DashBoardForm />
        </>
    )
}

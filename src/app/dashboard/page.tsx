import { signaturesAction } from "@/app/features/auth/actions/signatures-action";
import Header from "@/components/layout/header";

export default async function DashBoardPage() {
    const user = await signaturesAction();

    return (
        <>
            <title>ダッシュボード</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <div>
                <h1>ダッシュボード</h1>
                <p>ようこそ！</p>
            </div>
        </>
    )
}

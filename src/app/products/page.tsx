import Header from "@/components/layout/header";
import { signaturesAction } from "@/app/features/auth/actions/signatures-action";

export default async function ProductsListPage() {
    const user = await signaturesAction();

    return (
        <>
            <title>商品一覧</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <div className="flex w-full h-[calc(100vh-4rem)] bg-muted overflow-y-scroll">
                <div className="flex flex-col w-full h-full">
                    <h1 className="font-extrabold text-4xl">商品一覧</h1>
                </div>
            </div>
        </>
    );
}
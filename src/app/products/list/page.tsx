import Header from "@/components/layout/header";
import { signaturesAction } from "@/app/features/actions/signatures-action";
import ProductListForm from "../../features/products/components/list/list-form";
import { redirect } from "next/navigation";

export default async function ProductsListPage() {
    const user = await signaturesAction();
    const adminFlg = user?.admin;



    if (adminFlg) {
        redirect("/dashboard")
    }

    return (
        <>
            <title>商品一覧</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <ProductListForm />
        </>
    );
}
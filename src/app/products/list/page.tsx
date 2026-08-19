import Header from "@/components/layout/header";
import ProductListForm from "../../features/products/components/list/list-form";
import { redirect } from "next/navigation";
import { getCategories } from "@/app/features/products/actions/category-action";
import { getCurrentUser } from "@/lib/auth";

export default async function ProductsListPage() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    // カテゴリーの取得
    const categoryResult = await getCategories();
    const categories = categoryResult?.data ? categoryResult.data : [];

    if (adminFlg) {
        redirect("/dashboard")
    }

    return (
        <>
            <title>商品一覧</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <ProductListForm category={categories} />
        </>
    );
}
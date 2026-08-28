import { getCategories } from "@/app/features/products/actions/category-action";
import ProductManagementForm from "@/app/features/products/components/management/management-form";
import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";

export default async function ProductManagementPage() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    if (!user) {
        redirect("/login");
    }

    if (!adminFlg) {
        redirect("/products/list");
    }

    // カテゴリーの取得
    const categoryResult = await getCategories();
    const categories = categoryResult?.data ? categoryResult.data : [];

    return (
        <>
            <title>商品管理</title>
            <Header username={user.username!} admin={adminFlg} />
            <ProductManagementForm category={categories} />
        </>
    );
}
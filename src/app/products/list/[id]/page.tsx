import { getCategories } from "@/app/features/products/actions/category-action";
import { getProduct } from "@/app/features/products/actions/product-action";
import ProductListDetailsForm from "@/app/features/products/components/list/details-form";
import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";

export default async function listDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;
    const id = (await params).id;

    if (!user) {
        redirect("/login");
    }

    if (adminFlg) {
        redirect("/dashboard")
    }

    // 商品詳細用取得
    const productResult = await getProduct(id);
    const product = productResult?.data;

    // カテゴリーの取得
    const categoryResult = await getCategories();
    const categories = categoryResult?.data ? categoryResult.data : [];

    return (
        <>
            <title>商品詳細</title>
            <Header username={user.username!} admin={adminFlg} />
            <ProductListDetailsForm data={product} categories={categories} />
        </>
    );
}
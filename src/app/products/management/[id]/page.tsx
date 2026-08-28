import { getCategories } from "@/app/features/products/actions/category-action";
import { getProduct } from "@/app/features/products/actions/product-action";
import ProductDetailsForm from "@/app/features/products/components/management/details-form";
import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/jwt/auth";
import { redirect } from "next/navigation";

export default async function detailsPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;
    const id = (await params).id;

    // 商品詳細用取得
    const productResult = await getProduct(id);
    const product = productResult?.data;

    // カテゴリーの取得
    const categoryResult = await getCategories();
    const categories = categoryResult?.data ? categoryResult.data : [];

    if (!user) {
        redirect("/login");
    }

    if (!adminFlg) {
        redirect("/products/list");
    }

    return (
        <>
            <title>商品詳細</title>
            <Header username={user.username!} admin={adminFlg} />
            <ProductDetailsForm data={product} categories={categories} />
        </>
    );
}
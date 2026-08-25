import Header from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CartForm from "../features/carts/components/cart-form";
import { getCart } from "../features/carts/actions/cart-action";


export default async function ProductsListPage() {
    const user = await getCurrentUser();
    const adminFlg = user?.admin;

    if (adminFlg) {
        redirect("/dashboard")
    }

    const cart = await getCart();
    const items = cart.success ? cart.data?.items ?? [] : [];

    return (
        <>
            <title>カート詳細</title>
            <Header username={user?.username!} admin={user?.admin!} />
            <CartForm items={items} />
        </>
    );
}
"use client";

import { logoutAction } from "@/app/features/auth/actions/logout-action";
import { Button } from "../ui/button";
import { UserType } from "@/types/types";
import { redirect, useRouter } from "next/navigation";
import { toast } from "../ui/toast";
import { CircleUser, LogOut, MapPin, ShoppingCart } from "lucide-react";
import Image from "next/image";
import logo from "@/public/ecsite-title.png";
import { useCartCount } from "../providers/cart-count-provider";

export default function Header({ username, admin }: UserType) {

    const router = useRouter();
    const { cartItemsCount } = useCartCount();

    async function handleLogout() {
        const result = await logoutAction();

        if (result?.success) {
            toast.add({
                type: "success",
                description: result?.message,
            });
        }
        if (admin) {
            redirect("/login/admin");
        } else {
            redirect("/login");
        }
    }

    return (
        <header>
            <div className="flex justify-between items-center h-16 bg-olive-700/60 w-full px-4">
                <div className="flex justify-center items-center gap-7">
                    <Image src={logo} alt="Logo" className="h-15 w-auto invert" loading="eager" />
                    {admin ? null :
                        (<>
                            <div className="flex flex-col text-white items-start text-base">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <p>お届け先</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <p>〒001-0000</p>{/* ここはのちに取得した値を入れる*/}
                                    <p>東京都千代田区</p>{/* ここはのちに取得した値を入れる*/}
                                </div>
                            </div>
                        </>)}
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-white">
                        <p className="text-[12px]">こんにちは</p>
                        <p className="text-[18px]">{username}さん</p>
                    </div>
                    <div className="relative">
                        {admin === false ? (<ShoppingCart className="invert size-8 hover:cursor-pointer" onClick={() => router.push("/cart")} />) : null}
                        {cartItemsCount > 0 && (
                            <span className="absolute top-0 right-0 flex min-w-4 origin-center translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-destructive px-1 text-white text-xs">
                                {cartItemsCount}
                            </span>
                        )}
                    </div>

                    <CircleUser className="invert size-8" />
                    <Button onClick={handleLogout}>
                        ログアウト
                        <LogOut className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
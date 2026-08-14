"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getProducts } from "../../actions/product-action";
import { toast } from "@/components/ui/toast";

export default function ProductListForm() {
    const router = useRouter();

    // 商品を取得する
    const [data, setData] = useState<ProductType[]>([]);

    // ページング
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    // 検索
    const [phrase, setPhrase] = useState("");

    // 検索
    async function search() {
        const result = await getProducts(phrase, currentPage);
        if (result?.success) {
            setCurrentPage(result?.currentPage!);
            setTotalPage(result?.totalPage!);
            setData(result?.data!);
            router.refresh();
        } else {
            toast.add({
                type: "error",
                description: result?.message
            });
        }
    }

    // ページ数
    const generatePagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    // ページング用
    const handlePageChange = async (page: number) => {
        const result = await getProducts(phrase, page);
        if (result?.success) {
            setCurrentPage(result?.currentPage!);
            setTotalPage(result?.totalPage!);
            setData(result?.data!);
        } else {
            toast.add({
                type: "error",
                description: result?.message
            });
        }
    };

    return (
        <>
            <div className="flex w-full h-[calc(100vh-4rem)] bg-muted overflow-y-scroll">
                <Card className="w-full h-full">
                    <CardHeader>
                        <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-3xl">商品一覧</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>
        </>
    );
}
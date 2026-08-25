"use client"

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search } from "lucide-react";
import ListTable from "./table";
import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction, useRef } from "react";
import { getProducts } from "../../actions/product-action";
import { toast } from "@/components/ui/toast";
import { ProductType } from "@/types/types";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { redirect, useRouter } from "next/navigation";
import { category } from "@prisma/client";

// 子コンポーネントに渡すべき状態とデータ
export const ProductContext = createContext<ProductType[]>([]);
export const CategoryContext = createContext<category[]>([]);
export const OpenContext = createContext<boolean>(false);
export const SetOpenContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);

// 初期化
const productsData = () => useContext(ProductContext);
const categoriesData = () => useContext(CategoryContext);
const isOpen = () => useContext(OpenContext);
const changeOpen = () => useContext(SetOpenContext) as Dispatch<SetStateAction<boolean>>;

// importして使用させる
export { productsData, categoriesData, isOpen, changeOpen }

type searchProp = {
    page?: number
}

export default function ProductManagementForm({ category }: { category: category[] }) {

    const router = useRouter();

    // 商品を取得する
    const [data, setData] = useState<ProductType[]>([]);
    // カテゴリーを取得する
    const [categories, setCategories] = useState<category[]>([]);
    // 新規登録シートの開閉状態
    const [open, setOpen] = useState(false);

    // シートの状態保存
    const lastOpen = useRef(open);

    // ページング
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    // 検索
    const [phrase, setPhrase] = useState("");

    useEffect(() => {
        setCategories(category);
        search();
        if (lastOpen.current === true && open === false) {
            search();
        }
        lastOpen.current = open;
    }, [open]);

    // 検索
    async function search({ page = 1 }: searchProp = {}) {
        const result = await getProducts(phrase, page);
        if (result.success) {
            setCurrentPage(result.currentPage!);
            setTotalPage(result.totalPage!);
            setData(result.data!);
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
        search({ page: page });
    };

    return (
        <>
            <div className="flex w-full h-[calc(100vh-4rem)] bg-muted">
                <div className="flex flex-col w-full h-full p-5">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex justify-between">
                                <div className="flex items-center gap-3">
                                    <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => { redirect("/dashboard") }}></ChevronLeft>
                                    <CardTitle className="text-3xl">商品管理</CardTitle>
                                </div>
                                <Input className="ml-10 bg-white text-black border border-gray-300 h-12 py-2 px-4 w-100" name="search" value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="検索..." />
                                <Button type="submit" variant="ghost" size="icon" className="absolute right-12 px-3 py-6 hover:bg-transparent" onClick={() => search()}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardDescription className="px-6">
                            <ProductContext.Provider value={data}>
                                <CategoryContext.Provider value={categories}>
                                    <OpenContext.Provider value={open}>
                                        <SetOpenContext.Provider value={setOpen}>
                                            <ListTable />
                                        </SetOpenContext.Provider>
                                    </OpenContext.Provider>
                                </CategoryContext.Provider>
                            </ProductContext.Provider>
                        </CardDescription>
                        {data.length !== 0 && (
                            <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious className={`text-chart-3 ${currentPage <= 1 && "pointer-events-none text-black"}`} onClick={() => handlePageChange(currentPage - 1)} />
                                </PaginationItem>
                                {generatePagination().map((page, idx) => {
                                    return (
                                        <PaginationItem key={idx}>
                                            <PaginationLink className={`text-[20px] ${page === currentPage ? "bg-chart-4 text-white pointer-events-none" : ""}`} onClick={() => handlePageChange(page)}
                                                aria-disabled={`${page === currentPage}`}>{page}</PaginationLink>
                                        </PaginationItem>
                                    )
                                })}
                                <PaginationItem>
                                    <PaginationNext className={`text-chart-3 ${currentPage === totalPage && "pointer-events-none text-black"}`} onClick={() => handlePageChange(currentPage + 1)} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                        )}
                    </Card>
                </div>
            </div>
        </>
    )
}


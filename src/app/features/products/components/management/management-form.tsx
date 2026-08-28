"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        if (lastOpen.current === false && open === false) {
            // 初回検索
            search();
        } else if (lastOpen.current === true && open === false) {
            // シート閉じた時の検索
            search(currentPage);
        }
        lastOpen.current = open;
    }, [open]);

    // 検索
    async function search(page?: number) {
        const result = await getProducts(phrase, page ? page : 1);
        if (result?.success) {
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
        search(page);
    };

    return (
        <>
            <div className="h-[calc(100vh-4rem)] w-full bg-muted/40 p-5">
                <div className="mx-auto max-w-7xl h-full">
                    <Card className="h-full">
                        <CardHeader className="border-b bg-card">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3">
                                    <ChevronLeft className="size-10 text-chart-4 hover:cursor-pointer" onClick={() => redirect("/dashboard")}></ChevronLeft>
                                    <div>
                                        <CardTitle className="text-2xl">商品管理</CardTitle>
                                        <CardDescription className="mt-1">商品の登録、在庫、販売状態を管理します。</CardDescription>
                                    </div>
                                </div>
                                <div className="relative w-full lg:max-w-sm">
                                    <Input className="h-10 bg-background pr-10" name="search" value={phrase} onChange={(e) => setPhrase(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="商品名・カテゴリーで検索" />
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label="検索" onClick={() => search()}>
                                        <Search />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-5">
                            <ProductContext.Provider value={data}>
                                <CategoryContext.Provider value={categories}>
                                    <OpenContext.Provider value={open}>
                                        <SetOpenContext.Provider value={setOpen}>
                                            <ListTable />
                                        </SetOpenContext.Provider>
                                    </OpenContext.Provider>
                                </CategoryContext.Provider>
                            </ProductContext.Provider>
                        </CardContent>
                        {data.length !== 0 && (
                            <Pagination className="border-t py-4">
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

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types/types";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, } from "react";
import { toast } from "@/components/ui/toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { category } from "@prisma/client";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { ChevronRight, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/axios";
import { cartUpsert } from "@/app/features/carts/actions/cart-action";

type searchProp = {
    name?: string,
    category?: string,
    page?: number
}

export default function ProductListForm({ category }: { category: category[] }) {
    const router = useRouter();

    // 商品を取得する
    const [data, setData] = useState<ProductType[]>([]);

    // カテゴリーを取得する
    const [categories, setCategories] = useState<category[]>([]);

    // ページング
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    // 検索
    const [phrase, setPhrase] = useState("");
    // 選択したカテゴリー
    const [selectedCategory, setSelectedCategory] = useState("");

    // カート追加
    const [state, addCartAction, pending] = useActionState(cartUpsert, null);

    useEffect(() => {
        setCategories(category);
        search();
        if (!state) {
            return
        }
        toast.add({
            type: state.success ? "success" : "error",
            description: state.message
        });
    }, [selectedCategory, state]);

    // 検索
    async function search({ name = phrase, category = selectedCategory, page = 1 }: searchProp = {}) {
        const url = `/products/list/?name=${name ? name : ""}&category=${category ? category : ""}&page=${page ? page : 1}`;
        const result = await apiClient.get(url, {
            method: "GET",
            withCredentials: true,
        });
        if (result.data) {
            setCurrentPage(result.data.page);
            setTotalPage(result.data.totalPage);
            setData(result?.data.data);
            router.refresh();
        } else {
            toast.add({
                type: "error",
                description: result.data.message
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
        await search({ page });
    };

    // カテゴリー選択時
    async function handleSelectCategory(category: string) {
        setSelectedCategory(category);
        if (selectedCategory !== category) {
            search();
        } else {
            setSelectedCategory("");
        }
    }

    return (
        <>
            <div className="flex w-full h-[calc(100vh-4rem)] bg-muted p-5">
                <Card className="w-full h-full">
                    <CardHeader>
                        <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-3xl">商品一覧</CardTitle>
                            </div>
                            <ButtonGroup>
                                <Input className="bg-white text-black border border-gray-300 py-2 px-4 w-100" value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="検索..." />
                                <Button type="submit" className="px-5" onClick={() => search()}>
                                    <Search className="size-7" />
                                </Button>
                            </ButtonGroup>
                        </div>
                    </CardHeader>
                    <div className="flex w-full h-full">
                        <CardContent className="w-60 h-full gap-3">
                            <h1 className="text-lg">カテゴリー</h1>
                            <Separator orientation="horizontal" className="my-2 bg-gray-200" />
                            <ScrollArea className="h-full">
                                {categories.map((category, index) => (
                                    <div className={`flex items-center w-full px-5 py-2 gap-2 ${selectedCategory === category.name ? "bg-muted" : ""}`} key={index} >
                                        {selectedCategory === category.name ? <ChevronRight className="size-4" /> : null}
                                        <p className="hover:cursor-pointer" onClick={() => handleSelectCategory(category.name)}>{category.name}</p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </CardContent>
                        <Separator orientation="vertical" className="bg-gray-200" />
                        <CardDescription className="flex flex-col items-center justify-center w-full">
                            {data.length === 0 ? (
                                <div className="h-full rounded-xl p-8 text-center text-slate-500">
                                    該当する商品が見つかりませんでした。
                                </div>
                            ) : (
                                <>
                                    <Carousel className="w-full max-w-[calc(100vh+11rem)] ">
                                        <CarouselContent className="-ml-1">
                                            {data.map((item, index) => (
                                                <CarouselItem key={index} className="basis-1/2 pl-1">
                                                    <div className="p-1 w-[calc(50vh+5.5rem)] h-[calc(100vh-20rem)]">
                                                        <Card className="h-full">
                                                            <CardContent className="h-full">
                                                                <div className="cursor-pointer" onClick={() => router.push(`/products/list/${item.id}`)}>
                                                                    <div className="w-full text-2xl font-semibold truncate"><span>{item.name}</span></div>
                                                                    <div className="w-full h-45 bg-muted py-1"></div>
                                                                    <div className="w-full py-1">
                                                                        <div className="w-full">
                                                                            <div className="flex items-end justify-end py-2 gap-1">
                                                                                <p className="text-[18px]">¥</p><span className="text-3xl">{item.price?.toLocaleString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <form action={addCartAction}>
                                                                    <Input type="hidden" name="productId" value={item.id} />
                                                                    <Input type="hidden" name="quantity" value="1" />
                                                                    <Input type="hidden" name="isIncrement" value="true" />
                                                                    <Button type="submit" className="w-full" onClick={(event) => event.stopPropagation()}>カートに入れる</Button>
                                                                </form>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                    <Pagination className="pt-13">
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
                                </>
                            )}
                        </CardDescription>
                    </div>
                </Card >
            </div >
        </>
    );
}
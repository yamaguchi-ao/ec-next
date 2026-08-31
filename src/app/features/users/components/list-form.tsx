"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { redirect, useRouter } from "next/navigation";
import { users } from "@prisma/client";
import { getUsers } from "../actions/user-action";
import ListTable from "./table";

export const UserContext = createContext<users[]>([]);

const usersData = () => useContext(UserContext);

export { usersData }

export default function UserForm() {

    const router = useRouter();

    // ユーザーを取得する
    const [data, setData] = useState<users[]>([]);

    // ページング
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    // 検索
    const [phrase, setPhrase] = useState("");

    useEffect(() => {
        // 初回検索
        search();
    }, []);

    // 検索
    async function search(page?: number) {
        const result = await getUsers(phrase, page ? page : 1);
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
                                        <CardTitle className="text-2xl">ユーザー一覧</CardTitle>
                                        <CardDescription className="mt-1">ユーザーが持つ情報をリスト表示します。</CardDescription>
                                    </div>
                                </div>
                                <div className="relative w-full lg:max-w-sm">
                                    <Input className="h-10 bg-background pr-10" name="search" value={phrase} onChange={(e) => setPhrase(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="ユーザー名・メールアドレスで検索" />
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label="検索" onClick={() => search()}>
                                        <Search />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-5">
                            <UserContext.Provider value={data}>
                                <ListTable />
                            </UserContext.Provider>
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

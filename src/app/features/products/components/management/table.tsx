"use client"
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontalIcon, Pencil, Trash2 } from "lucide-react";
import RegisterSheet from "./sheet";
import { managementTitle } from "@/types/products";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { productDelete } from "../../actions/product-action";
import { productsData } from "./management-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function ListTable() {
    const router = useRouter();
    const products = productsData();

    // 削除ダイアログ用
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // 商品管理テーブルのheaderをマップ化
    const headerMap = Object.entries(managementTitle).map(([key, value]) => ({ key, value }));

    // 更新画面に遷移する
    async function handleEdit(productId: string) {
        return router.push("/products/management/" + productId);
    }

    // 削除処理を呼ぶ
    async function handleDelete(productId: string) {
        const result = await productDelete(productId);
        if (result?.success) {
            router.refresh();
        }
        toast.add({
            type: result.success ? "success" : "error",
            description: result?.message
        });
    }

    // ダイアログ開く用
    function handleOpenDialog(selectedId: string, event: React.MouseEvent<HTMLDivElement>) {
        event?.preventDefault();
        setSelectedId(selectedId);
        setIsDialogOpen(true);
    }

    return (
        <>
            <ScrollArea className="h-[calc(100vh-18rem)] rounded-lg border">
                <Table>
                    <TableHeader className="bg-chart-4 pointer-events-none">
                        <TableRow className="text-[20px]">
                            {headerMap?.map((item, index) => {
                                return (
                                    <TableHead key={index} className={`text-white text-center ${item.value === "商品名" && "w-80"}`}>{item.value}</TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {products && products.map((item, idx) => {
                            return (
                                <TableRow key={idx} className={`text-[18px] ${idx % 2 !== 0 ? "bg-chart-2/20 hover:bg-chart-2/30" : "hover:bg-muted"}`}>
                                    <TableCell className="text-center border-r border-border">{item.name}</TableCell>
                                    <TableCell className="text-center border-r border-border">{item.category?.name}</TableCell>
                                    <TableCell className="text-right border-r border-border">¥ {item.price?.toLocaleString("ja-JP")}</TableCell>
                                    <TableCell className="text-right border-r border-border">{item.count?.toLocaleString("ja-JP")}</TableCell>
                                    <TableCell className="text-center border-r border-border">{item.is_on_sale ? "販売中" : "未発売"}</TableCell>
                                    <TableCell className="text-center w-25">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">Open menu</span></Button>} />
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="hover:cursor-pointer" onClick={() => handleEdit(item.id!)}>
                                                    <Pencil />
                                                    編集
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-400/30" />
                                                <DropdownMenuItem className="hover:cursor-pointer" variant="destructive" onClick={(event) => handleOpenDialog(item.id!, event)}>
                                                    <Trash2 />削除
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {selectedId === item.id &&
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>商品の削除</DialogTitle>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        商品の削除を行います。本当に削除していいですか？
                                                    </DialogDescription>
                                                    <DialogFooter>
                                                        <DialogClose render={<Button variant="outline" onClick={() => { setIsDialogOpen(false) }}>いいえ</Button>} />
                                                        <Button className="bg-red-600 hover:bg-red-800" type="submit"
                                                            onClick={() => {
                                                                handleDelete(item.id!);
                                                                setIsDialogOpen(false);
                                                            }}>はい</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        }
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {/* 新規登録用 */}
                        <TableRow>
                            <TableCell className="-p-2 h-10" colSpan={6}>
                                <RegisterSheet />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </ScrollArea>

        </>
    )
}

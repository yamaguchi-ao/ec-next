"use client"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LucideArchiveX, MoreHorizontalIcon, SquarePen } from "lucide-react";
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
            type: result?.success ? "success" : "error",
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
            <ScrollArea className="h-[calc(100vh-21rem)] rounded-lg border bg-background">
                <Table>
                    <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                        <TableRow>
                            {headerMap?.map((item, index) => {
                                return (
                                    <TableHead key={index} className={`text-center ${item.value === "商品名" && "min-w-64"}`}>{item.value}</TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {products && products.map((item, idx) => {
                            return (
                                <TableRow key={idx} className="group">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.category?.name ?? "未分類"}</TableCell>
                                    <TableCell className="text-right tabular-nums">¥ {item.price?.toLocaleString("ja-JP")}</TableCell>
                                    <TableCell className={`text-right tabular-nums ${item.count !== undefined && item.count <= 5 ? "font-semibold text-destructive" : ""}`}>{item.count?.toLocaleString("ja-JP")}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={item.is_on_sale
                                                ? "border-green-200 bg-green-100 text-green-800"
                                                : "border-gray-200 bg-gray-100 text-gray-600"}
                                        >
                                            {item.is_on_sale ? "販売中" : "販売停止"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="w-25 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger render={
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">Open menu</span></Button>} />
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="hover:cursor-pointer" onClick={() => handleEdit(item.id!)}>
                                                    <SquarePen />
                                                    編集
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-400/30" />
                                                <DropdownMenuItem className="hover:cursor-pointer" variant="destructive" onClick={(event) => handleOpenDialog(item.id!, event)}>
                                                    <LucideArchiveX />販売停止
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {selectedId === item.id &&
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>商品の販売停止</DialogTitle>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        商品の販売停止を行います。本当に削除していいですか？
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
                        {products.length === 0 && <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">該当する商品がありません。</TableCell>
                        </TableRow>}
                        <TableRow className="bg-muted/30">
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

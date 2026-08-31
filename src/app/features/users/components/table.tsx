"use client"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontalIcon, SquarePen, Trash2 } from "lucide-react";
import { userTitle } from "@/types/products";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { usersData } from "./list-form";
import { userDelete } from "../actions/user-action";

export default function ListTable() {
    const router = useRouter();
    const users = usersData();

    // 削除ダイアログ用
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // 商品管理テーブルのheaderをマップ化
    const headerMap = Object.entries(userTitle).map(([key, value]) => ({ key, value }));

    // 更新画面に遷移する
    async function handleEdit(userId: number) {
        return router.push("/users/" + userId);
    }

    // 削除処理を呼ぶ
    async function handleDelete(userId: number) {
        const result = await userDelete(userId);
        if (result?.success) {
            router.refresh();
        }
        toast.add({
            type: result?.success ? "success" : "error",
            description: result?.message
        });
    }

    // ダイアログ開く用
    function handleOpenDialog(selectedId: number, event: React.MouseEvent<HTMLDivElement>) {
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
                                    <TableHead key={index} className={`text-center`}>{item.value}</TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {users && users.map((item, idx) => {
                            return (
                                <TableRow key={idx} className="">
                                    <TableCell className="font-medium text-center">{item.username}</TableCell>
                                    <TableCell className="font-medium text-center">{item.email}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline" className={"border-gray-200 bg-gray-100 text-gray-600"} >
                                            {item.admin === false && "一般ユーザ"}
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
                                                    <Trash2 />削除
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {selectedId === item.id &&
                                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>ユーザーの削除</DialogTitle>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        ユーザーの削除を行います。本当に削除していいですか？
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
                        {users.length === 0 && <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">該当するユーザーが居ません。</TableCell>
                        </TableRow>}
                    </TableBody>
                </Table>
            </ScrollArea>

        </>
    )
}

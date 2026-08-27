import Link from "next/link";
import { ArrowUpRight, Boxes, ClipboardList, PackageSearch, ShoppingCart, Users } from "lucide-react";
import { getDashboardData } from "../actions/search-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currency = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" });

export default async function DashBoardForm() {
    const dashboard = await getDashboardData();
    const summary = [
        { label: "売上合計", value: currency.format(dashboard.sales), icon: ShoppingCart },
        { label: "注文数", value: dashboard.orderCount.toLocaleString("ja-JP"), icon: ClipboardList },
        { label: "商品数", value: dashboard.productCount.toLocaleString("ja-JP"), icon: Boxes },
        { label: "会員数", value: dashboard.userCount.toLocaleString("ja-JP"), icon: Users },
    ];

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-muted/40 p-5">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">ダッシュボード</h1>
                        <p className="text-muted-foreground">ショップの状況を確認できます。</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" render={<Link href="/products/list" />}>商品ページ <ArrowUpRight /></Button>
                        <Button render={<Link href="/products/management" />}>商品を管理 <PackageSearch /></Button>
                    </div>
                </div>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {summary.map(({ label, value, icon: Icon }) => (
                        <Card key={label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardDescription>{label}</CardDescription>
                                <Icon className="size-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent><p className="text-2xl font-semibold">{value}</p></CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>最近の注文</CardTitle>
                            <CardDescription>最新5件の注文状況</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboard.recentOrders.length === 0 ? <p className="py-8 text-center text-muted-foreground">注文はありません。</p> : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>注文者</TableHead><TableHead>注文日</TableHead><TableHead>ステータス</TableHead><TableHead className="text-right">合計</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {dashboard.recentOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.users.username}</TableCell>
                                                <TableCell>{dateFormatter.format(order.created_at)}</TableCell>
                                                <TableCell><Badge variant={order.order_status === "キャンセル" ? "destructive" : "secondary"}>{order.order_status}</Badge></TableCell>
                                                <TableCell className="text-right">{currency.format(order.total_price)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>在庫アラート</CardTitle>
                            <CardDescription>対応待ちの注文 {dashboard.pendingOrderCount} 件 / 在庫5個以下の商品</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dashboard.lowStockProducts.length === 0 ? <p className="py-8 text-center text-muted-foreground">在庫に問題はありません。</p> : (
                                <div className="space-y-4">
                                    {dashboard.lowStockProducts.map((product) => (
                                        <div className="flex items-center justify-between gap-4" key={product.id}>
                                            <div className="min-w-0"><p className="truncate font-medium">{product.name}</p><p className="text-sm text-muted-foreground">{product.is_on_sale ? "販売中" : "販売停止"}</p></div>
                                            <Badge variant={product.count === 0 ? "destructive" : "outline"}>残り {product.count} 個</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}

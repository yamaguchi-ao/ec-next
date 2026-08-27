"use server";

import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

const orderStatusLabels = {
    PENDING: "受付待ち",
    PROCESSING: "処理中",
    SHIPPED: "発送済み",
    DELIVERED: "配達完了",
    CANCELED: "キャンセル",
} as const;

export async function getDashboardData() {
    await requireAdmin();

    const [productCount, userCount, orderCount, sales, pendingOrderCount, lowStockProducts, recentOrders] =
        await Promise.all([
            prisma.products.count(),
            prisma.users.count({ where: { admin: false } }),
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { total_price: true }, where: { order_status: { not: "CANCELED" } } }),
            prisma.order.count({ where: { order_status: { in: ["PENDING", "PROCESSING"] } } }),
            prisma.products.findMany({
                where: { count: { lte: 5 } },
                orderBy: { count: "asc" },
                take: 5,
                select: { id: true, name: true, count: true, is_on_sale: true },
            }),
            prisma.order.findMany({
                orderBy: { created_at: "desc" },
                take: 5,
                select: { id: true, total_price: true, order_status: true, created_at: true, users: { select: { username: true } } },
            }),
        ]);

    return {
        productCount,
        userCount,
        orderCount,
        sales: sales._sum.total_price ?? 0,
        pendingOrderCount,
        lowStockProducts,
        recentOrders: recentOrders.map((order) => ({ ...order, order_status: orderStatusLabels[order.order_status] })),
    };
}
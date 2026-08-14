"use client"

import { Button } from "@/components/ui/button";
import { TableProperties } from "lucide-react";
import { redirect } from "next/navigation";

export default function DashBoardForm() {
    return (
        <>
            <div>
                <h1>ダッシュボード</h1>
                <p>ようこそ！</p>
            </div>
            <div>
                <Button onClick={() => { redirect("/products/management") }}>
                    <TableProperties />
                </Button>
            </div>
        </>
    );
}
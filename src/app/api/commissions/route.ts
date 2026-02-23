import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = (session.user as any).role;
        const isSalesStaff = role === "SALES";

        const commissions = await prisma.salesCommission.findMany({
            where: {
                tenantId: session.user.tenantId,
                ...(isSalesStaff ? { salespersonId: session.user.id } : {}) // Sales only sees their own
            },
            include: {
                customer: { select: { name: true, phone: true, status: true, plan: { select: { price: true } } } },
                salesperson: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(commissions);
    } catch (error) {
        console.error("Failed to fetch commissions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

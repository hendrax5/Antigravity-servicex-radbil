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

        const invoices = await prisma.invoice.findMany({
            where: { customer: { tenantId: session.user.tenantId } },
            include: { customer: { include: { plan: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        const newInvoice = await prisma.invoice.create({
            data: {
                amount: data.amount,
                status: data.status || "UNPAID",
                dueDate: new Date(data.dueDate),
                customerId: data.customerId,
            },
        });

        return NextResponse.json(newInvoice, { status: 201 });
    } catch (error) {
        console.error("Failed to create invoice:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

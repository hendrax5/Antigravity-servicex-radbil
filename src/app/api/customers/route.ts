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

        const customers = await prisma.customer.findMany({
            where: { tenantId: session.user.tenantId },
            include: {
                plan: true,
                salesperson: { select: { id: true, name: true } },
                technician: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
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

        const newCustomer = await prisma.customer.create({
            data: {
                username: data.username,
                password: data.password, // In real world, hash this for safety
                name: data.name,
                phone: data.phone || null,
                type: data.type || "HOTSPOT",
                status: "PENDING_INSTALL",
                planId: data.planId,
                tenantId: session.user.tenantId,
                salespersonId: (session.user as any).role === "SALES" || (session.user as any).role === "MANAGER_SALES" ? session.user.id : null,
            },
            include: { plan: true }
        });

        // Trigger Commission Generation if created by Sales
        if (newCustomer.salespersonId && newCustomer.plan) {
            // Give 10% commission on the first month's plan price
            const commissionAmount = Number(newCustomer.plan.price) * 0.10;
            await prisma.salesCommission.create({
                data: {
                    amount: commissionAmount,
                    status: "PENDING",
                    customerId: newCustomer.id,
                    salespersonId: newCustomer.salespersonId,
                    tenantId: session.user.tenantId
                }
            });
        }

        return NextResponse.json(newCustomer, { status: 201 });
    } catch (error) {
        console.error("Failed to create customer:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

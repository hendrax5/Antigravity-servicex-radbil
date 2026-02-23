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

        const resellers = await prisma.reseller.findMany({
            where: { tenantId: session.user.tenantId },
            include: {
                customers: { select: { id: true, plan: { select: { price: true } } } }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(resellers);
    } catch (error) {
        console.error("Failed to fetch resellers:", error);
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

        const newReseller = await prisma.reseller.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                balance: data.balance || 0,
                tenantId: session.user.tenantId,
            },
        });

        return NextResponse.json(newReseller, { status: 201 });
    } catch (error) {
        console.error("Failed to create reseller:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

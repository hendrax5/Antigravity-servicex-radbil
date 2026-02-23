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

        const plans = await prisma.servicePlan.findMany({
            where: { tenantId: session.user.tenantId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(plans);
    } catch (error) {
        console.error("Failed to fetch plans:", error);
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

        const newPlan = await prisma.servicePlan.create({
            data: {
                name: data.name,
                price: data.price,
                type: data.type || "HOTSPOT",
                bandwidth: data.bandwidth,
                validity: parseInt(data.validity),
                tenantId: session.user.tenantId,
            },
        });

        return NextResponse.json(newPlan, { status: 201 });
    } catch (error) {
        console.error("Failed to create plan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

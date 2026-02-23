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

        // Fetch POPs with their nested ODPs and Customer counts
        const pops = await prisma.pop.findMany({
            where: { tenantId: session.user.tenantId },
            include: {
                odps: {
                    include: {
                        customers: { select: { id: true, status: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(pops);
    } catch (error) {
        console.error("Failed to fetch topology:", error);
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

        if (data.type === "POP") {
            const newPop = await prisma.pop.create({
                data: {
                    name: data.name,
                    location: data.location,
                    tenantId: session.user.tenantId
                }
            });
            return NextResponse.json(newPop, { status: 201 });
        }
        else if (data.type === "ODP") {
            const newOdp = await prisma.odp.create({
                data: {
                    name: data.name,
                    location: data.location,
                    portCount: parseInt(data.portCount),
                    popId: data.popId
                }
            });
            return NextResponse.json(newOdp, { status: 201 });
        }

        return NextResponse.json({ error: "Invalid Type" }, { status: 400 });
    } catch (error) {
        console.error("Failed to topology:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

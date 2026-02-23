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

        const odps = await prisma.odp.findMany({
            where: {
                pop: {
                    tenantId: session.user.tenantId
                }
            },
            include: {
                pop: {
                    select: { name: true }
                },
                _count: {
                    select: { customers: true }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        // Add a computed property for available ports
        const odpsWithPorts = odps.map(odp => ({
            ...odp,
            availablePorts: Math.max(0, odp.portCount - odp._count.customers)
        }));

        return NextResponse.json(odpsWithPorts);
    } catch (error) {
        console.error("Failed to fetch ODPs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

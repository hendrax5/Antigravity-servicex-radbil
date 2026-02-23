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

        const routers = await prisma.router.findMany({
            where: { tenantId: session.user.tenantId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(routers);
    } catch (error) {
        console.error("Failed to fetch routers:", error);
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

        const newRouter = await prisma.router.create({
            data: {
                name: data.name,
                ipAddress: data.ipAddress,
                username: data.username,
                password: data.password, // In a real scenario, this MUST be encrypted in DB
                apiPort: data.apiPort ? parseInt(data.apiPort) : 8728,
                vpnIp: data.vpnIp || null,
                tenantId: session.user.tenantId,
            },
        });

        return NextResponse.json(newRouter, { status: 201 });
    } catch (error) {
        console.error("Failed to create router:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

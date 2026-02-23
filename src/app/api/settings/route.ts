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

        const tenant = await prisma.tenant.findUnique({
            where: { id: session.user.tenantId },
            select: {
                mootaSecret: true,
                acsUrl: true,
                acsAuthToken: true
            }
        });

        return NextResponse.json(tenant);
    } catch (error) {
        console.error("GET /api/settings Error:", error);
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

        const updatedTenant = await prisma.tenant.update({
            where: { id: session.user.tenantId },
            data: {
                mootaSecret: data.mootaSecret,
                acsUrl: data.acsUrl,
                acsAuthToken: data.acsAuthToken
            }
        });

        return NextResponse.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
        console.error("POST /api/settings Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

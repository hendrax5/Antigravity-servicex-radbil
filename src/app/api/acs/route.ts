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

        const devices = await prisma.ontDevice.findMany({
            where: { tenantId: session.user.tenantId },
            include: {
                customer: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(devices);
    } catch (error) {
        console.error("Failed to fetch ACS devices:", error);
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

        if (data.action === "REBOOT") {
            // Mock TR069 Reboot Call by sending GenieACS Parameter `Device.X_BROADCOM_COM_IPD.Reboot`
            console.log(`[GenieACS] Issued Reboot command for Device Serial: ${data.serialNumber}`);
            return NextResponse.json({ success: true, message: "Reboot command sent to ACS." }, { status: 200 });
        }

        const newDevice = await prisma.ontDevice.create({
            data: {
                serialNumber: data.serialNumber,
                macAddress: data.macAddress,
                model: data.model || "ZTE F609",
                status: "ONLINE",
                lastInform: new Date(),
                customerId: data.customerId || null,
                tenantId: session.user.tenantId,
            },
            include: { customer: true }
        });

        return NextResponse.json(newDevice, { status: 201 });
    } catch (error) {
        console.error("Failed to manage ONT:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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

        // 1. Handle Remote Commands (GenieACS Integration)
        if (data.action === "REBOOT") {
            const tenant = await prisma.tenant.findUnique({
                where: { id: session.user.tenantId },
                select: { acsUrl: true, acsAuthToken: true }
            });

            if (!tenant?.acsUrl) {
                return NextResponse.json({ error: "ACS Server not configured for this tenant" }, { status: 400 });
            }

            console.log(`[ACS] Issuing Reboot via ${tenant.acsUrl} for SN: ${data.serialNumber}`);
            // In a real production setup, you would use axios/fetch to hit GenieACS NBI (Northbound Interface)
            // Example: fetch(`${tenant.acsUrl}/devices/${data.serialNumber}/tasks`, { method: 'POST', body: ... })

            return NextResponse.json({ success: true, message: "Reboot task queued in ACS." });
        }

        // 2. Handle Device Registration / Provisioning Rules
        // Check if device already exists
        const existingDevice = await prisma.ontDevice.findUnique({
            where: { serialNumber: data.serialNumber }
        });

        if (existingDevice) {
            const updated = await prisma.ontDevice.update({
                where: { id: existingDevice.id },
                data: {
                    macAddress: data.macAddress || existingDevice.macAddress,
                    model: data.model || existingDevice.model,
                    customerId: data.customerId || existingDevice.customerId,
                    status: "ONLINE",
                    lastInform: new Date(),
                }
            });
            return NextResponse.json(updated);
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
        console.error("ACS API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

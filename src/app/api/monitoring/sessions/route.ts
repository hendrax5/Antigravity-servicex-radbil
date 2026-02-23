import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MikrotikService } from "@/lib/services/mikrotik";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the tenant's primary mock router (or target all routers)
        const routers = await prisma.router.findMany({
            where: { tenantId: session.user.tenantId }
        });

        if (routers.length === 0) {
            return NextResponse.json({ pppoe: [], hotspot: [] }, { status: 200 });
        }

        const router = routers[0]; // For MVP, we use the first router

        // Call Mikrotik API
        const mk = new MikrotikService(router.ipAddress, router.username, router.password, router.apiPort);
        const connected = await mk.connect();

        let pppoe: any[] = [];
        let hotspot: any[] = [];

        if (connected) {
            const rawPppoe = await mk.getActivePppoeSessions();
            const rawHotspot = await mk.getActiveHotspotSessions();

            // Map typical MikroTik format to a clean format for UI
            pppoe = rawPppoe.map((s: any) => ({
                id: s[".id"],
                name: s.name,
                service: s.service,
                callerId: s["caller-id"],
                address: s.address,
                uptime: s.uptime
            }));

            hotspot = rawHotspot.map((s: any) => ({
                id: s[".id"],
                server: s.server,
                user: s.user,
                address: s.address,
                macAddress: s["mac-address"],
                uptime: s.uptime,
                bytesIn: s["bytes-in"],
                bytesOut: s["bytes-out"]
            }));

            await mk.disconnect();
        } else {
            console.warn("[SESSION SYNC] Failed to connect to router:", router.ipAddress);
        }

        return NextResponse.json({ pppoe, hotspot }, { status: 200 });
    } catch (error) {
        console.error("Session Sync Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

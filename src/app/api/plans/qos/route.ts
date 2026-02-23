import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MikrotikService } from "@/lib/services/mikrotik";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST /api/plans/qos
// Trigger a bulk or single update to MikroTik Simple Queues when a Plan Banditwidth changes
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId, newBandwidth } = await req.json();

        if (!planId || !newBandwidth) {
            return NextResponse.json({ error: "Missing planId or newBandwidth" }, { status: 400 });
        }

        // Find all active customers on this plan
        const plan = await prisma.servicePlan.findUnique({
            where: { id: planId },
            include: {
                customers: {
                    where: { status: "ACTIVE" },
                    include: { tenant: { include: { routers: true } } }
                }
            }
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        let updatedCount = 0;
        let failedCount = 0;

        for (const customer of plan.customers) {
            // Assume single router tenant MVP for QoS orchestration
            const router = customer.tenant?.routers?.[0];
            if (router) {
                try {
                    console.log(`[QoS SYNC] Updating bandwidth for ${customer.username} to ${newBandwidth}`);
                    const mk = new MikrotikService(router.ipAddress, router.username, router.password, router.apiPort);
                    const connected = await mk.connect();
                    if (connected) {
                        const success = await mk.setSimpleQueue(customer.username, newBandwidth);
                        if (success) {
                            updatedCount++;
                        } else {
                            failedCount++;
                        }
                        await mk.disconnect();
                    } else {
                        failedCount++;
                    }
                } catch (e) {
                    console.error(`[QoS ERROR] Failed sync for ${customer.username}:`, e);
                    failedCount++;
                }
            }
        }

        // Apply new bandwidth purely to the DB plan so new subscribers get it
        await prisma.servicePlan.update({
            where: { id: planId },
            data: { bandwidth: newBandwidth }
        });

        return NextResponse.json({
            success: true,
            message: `QoS Synchronized. Applied: ${updatedCount}, Failed: ${failedCount}`
        }, { status: 200 });

    } catch (error) {
        console.error("QoS Sync Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MikrotikService } from "@/lib/services/mikrotik";

const prisma = new PrismaClient();

// Simulated CRON Endpoint or Manual trigger to isolate overdue customers
export async function POST(req: Request) {
    try {
        const bodyObj = await req.json().catch(() => ({}));

        // --- 1. ISOLIR (SUSPENSION) LOGIC ---
        const overdueInvoices = await prisma.invoice.findMany({
            where: {
                status: "UNPAID",
                dueDate: { lt: new Date() } // past due
            },
            include: {
                customer: {
                    include: {
                        plan: true,
                        tenant: { include: { routers: true } }
                    }
                }
            }
        });

        const isolatedCustomers: { id: string, name: string, status: string }[] = [];

        for (const inv of overdueInvoices) {
            console.log(`[AUTO-ISOLIR] Executing suspension macro for ${inv.customer.username}...`);
            let pppoeSuccess = false;

            // Assuming customer is tied to the first router of the Tenant for MVP. 
            // In production, Customer model should have `routerId`.
            const defaultRouter = inv.customer.tenant?.routers?.[0];

            if (defaultRouter) {
                try {
                    const mk = new MikrotikService(defaultRouter.ipAddress, defaultRouter.username, defaultRouter.password, defaultRouter.apiPort);
                    const connected = await mk.connect();
                    if (connected) {
                        // Force the radius profile to an ISOLIR walled-garden profile
                        await mk.setPppoeProfile(inv.customer.username, "ISOLIR_PROFILE");
                        pppoeSuccess = true;
                        await mk.disconnect();
                    }
                } catch (e) {
                    console.warn(`[MIKROTIK WARNING] Suspension failed for ${inv.customer.username}.`, e);
                }
            }

            // Update DB Status regardless of router success (to ensure billing logic applies)
            await prisma.customer.update({
                where: { id: inv.customerId },
                data: { status: "ISOLIR" }
            });

            isolatedCustomers.push({
                id: inv.customerId,
                name: inv.customer.name,
                status: `SUSPENDED_OVERDUE (Router Sync: ${pppoeSuccess ? 'OK' : 'SERVER-ONLY'})`
            });
        }

        // --- 2. TRAFFIC SHAPING (QoS) LOGIC ---
        const { fupCustomerId, throttleSpeed, targetRouterId } = bodyObj;

        let qosSuccess = false;
        if (fupCustomerId && throttleSpeed && targetRouterId) {
            console.log(`[TRAFFIC SHAPING] Modifying Simple Queue for Customer ${fupCustomerId} to ${throttleSpeed}...`);

            const router = await prisma.router.findUnique({ where: { id: targetRouterId } });
            const customer = await prisma.customer.findUnique({ where: { id: fupCustomerId } });

            if (router && customer) {
                try {
                    const mk = new MikrotikService(router.ipAddress, router.username, router.password, router.apiPort);
                    const connected = await mk.connect();
                    if (connected) {
                        // Example speed limit string: "1M/1M"
                        await mk.setSimpleQueue(customer.username, throttleSpeed);
                        qosSuccess = true;
                        await mk.disconnect();
                    }
                } catch (e) {
                    console.error("[TRAFFIC SHAPING ERROR]", e);
                }
            }
        }

        return NextResponse.json({
            success: true,
            isolatedCount: isolatedCustomers.length,
            isolatedCustomers,
            trafficShaping: fupCustomerId ? (qosSuccess ? "SUCCESS" : "FAILED") : "NOT_REQUESTED"
        }, { status: 200 });

    } catch (error) {
        console.error("Auto Isolir Failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

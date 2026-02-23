import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { MikrotikService } from "@/lib/services/mikrotik";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Ensure user is logged in as CUSTOMER
        if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const customerId = session.user.id;

        // Fetch customer details including their plan, tickets, and latest invoices
        const customerInfo = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                plan: true,
                invoices: {
                    orderBy: { dueDate: "desc" },
                    take: 3
                },
                tickets: {
                    orderBy: { createdAt: "desc" },
                    take: 2
                },
                ontDevices: {
                    take: 1
                }
            }
        });

        if (!customerInfo) {
            return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
        }

        // Try to fetch live PPPoE Secret Status from MikroTik if applicable
        let liveStatus = { connected: false, uptime: "-", bytesIn: "0 B", bytesOut: "0 B" };
        let wifiSecret: any = null;

        try {
            // Find a router in the same tenant to query (Assumption: Single core router or assigned router)
            const router = await prisma.router.findFirst({ where: { tenantId: customerInfo.tenantId } });
            if (router && customerInfo.type === "PPPOE") {
                const mt = new MikrotikService(router.ipAddress, router.username, router.password, router.apiPort);
                const conn = mt;

                // Check Active Sessions
                const activeSessions = await conn.writeCommand('/ppp/active/print', [`?name=${customerInfo.username}`]);
                if (activeSessions.length > 0) {
                    liveStatus.connected = true;
                    liveStatus.uptime = activeSessions[0].uptime || "-";
                }

                // Get WiFi Password (PPP Secret Password)
                const secrets = await conn.writeCommand('/ppp/secret/print', [`?name=${customerInfo.username}`]);
                if (secrets.length > 0) {
                    wifiSecret = secrets[0].password;
                }
            }
        } catch (err) {
            console.error("Failed to fetch live Mikrotik status for customer:", err);
            // Non-blocking error
        }

        return NextResponse.json({
            profile: {
                name: customerInfo.name,
                username: customerInfo.username,
                phone: customerInfo.phone,
                status: customerInfo.status,
            },
            plan: {
                name: customerInfo.plan.name,
                bandwidth: customerInfo.plan.bandwidth,
                price: customerInfo.plan.price
            },
            network: liveStatus,
            device: customerInfo.ontDevices?.[0] || null,
            wifiPassword: wifiSecret,
            recentInvoices: customerInfo.invoices,
            recentTickets: customerInfo.tickets
        });

    } catch (error) {
        console.error("GET /api/client/dashboard Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

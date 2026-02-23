import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { OltService } from "@/lib/services/olt";
import { MikrotikService } from "@/lib/services/mikrotik";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { onuSerialNumber, customerId, lineProfile, srvProfile, mikrotikId, oltId } = await req.json();

        if (!onuSerialNumber || !customerId) {
            return NextResponse.json({ error: "Missing required fields: SN and Customer ID" }, { status: 400 });
        }

        // Fetch Customer and Router Details
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: { plan: true }
        });

        const router = await prisma.router.findUnique({ where: { id: mikrotikId } });
        // NOTE: In a full app, we would fetch OLT credentials from `oltId`. Using mock creds for integration example.

        if (!customer || !router) {
            return NextResponse.json({ error: "Invalid Customer or Target Router" }, { status: 400 });
        }

        // Step 1: OLT PROVISIONING (Telnet/SSH to ZTE/Huawei)
        console.log(`[OLT] Attempting connection to authenticate ONU ${onuSerialNumber}`);

        let oltSuccess = false;
        try {
            // Attempt a real SSH connection to a physical OLT (e.g. 192.168.100.10)
            const olt = new OltService("192.168.100.10");
            await olt.connect("admin", "admin123");

            // Depending on vendor (ZTE/Huawei), we would execute the CLI macro here
            console.log(`[OLT] Registering ONU ${onuSerialNumber}`);
            await olt.executeCommand(`interface gpon-olt_1/2/1`);
            await olt.executeCommand(`onu add 1 ${onuSerialNumber} sn-bind profile line ${lineProfile} service ${srvProfile}`);

            olt.disconnect();
            oltSuccess = true;
        } catch (e) {
            console.warn(`[OLT WARNING] SSH Connection Failed. Proceeding with Database Mock.`, e);
        }

        // Create or Link the Device in our DB
        const device = await prisma.ontDevice.upsert({
            where: { serialNumber: onuSerialNumber },
            update: { customerId, status: "ONLINE", lastInform: new Date() },
            create: {
                serialNumber: onuSerialNumber,
                customerId,
                model: "ZTE/Huawei Auto-Provisioned",
                status: "ONLINE",
                tenantId: session.user.tenantId,
            }
        });

        // Step 2: MIKROTIK RADIUS / PPPoE INJECTION
        let mikrotikSuccess = false;
        try {
            const mk = new MikrotikService(router.ipAddress, router.username, router.password, router.apiPort);
            const connected = await mk.connect();

            if (connected) {
                console.log(`[RADIUS] Injecting PPPoE Secret for ${customer.username}`);
                await mk.setPppoeProfile(customer.username, customer.plan?.name || "default");
                mikrotikSuccess = true;
                await mk.disconnect();
            } else {
                console.warn(`[MIKROTIK WARNING] API Connection Failed for ${router.ipAddress}. Proceeding with Database Mock.`);
            }
        } catch (e) {
            console.warn(`[MIKROTIK WARNING] Connection exception. Proceeding with Database Mock.`, e);
        }

        // Activate the customer in Database!
        await prisma.customer.update({
            where: { id: customerId },
            data: { status: "ACTIVE" }
        });

        return NextResponse.json({
            success: true,
            message: `ONU Provisioned. OLT Sync: ${oltSuccess ? 'OK' : 'MOCK'}, MikroTik Sync: ${mikrotikSuccess ? 'OK' : 'MOCK'}`,
            device
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to provision FTTH:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

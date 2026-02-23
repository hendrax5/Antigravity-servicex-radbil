import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { MikrotikService } from "@/lib/services/mikrotik";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const customerId = session.user.id;
        const { newPassword } = await req.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const customerInfo = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customerInfo || customerInfo.type !== "PPPOE") {
            return NextResponse.json({ error: "Only PPPoE customers can change WiFi passwords directly." }, { status: 400 });
        }

        // Apply new password to MikroTik directly
        const router = await prisma.router.findFirst({ where: { tenantId: customerInfo.tenantId } });
        if (!router) {
            return NextResponse.json({ error: "No router configured for this tenant" }, { status: 500 });
        }

        const mt = new MikrotikService(router.ipAddress, router.username, router.password, router.apiPort);
        const conn = mt;

        // Find existing secret
        const secrets = await conn.writeCommand('/ppp/secret/print', [`?name=${customerInfo.username}`]);
        if (secrets.length === 0) {
            return NextResponse.json({ error: "PPPoE Secret not found on Router" }, { status: 404 });
        }

        const secretId = secrets[0]['.id'];

        // Update password
        await conn.writeCommand('/ppp/secret/set', [`=.id=${secretId}`, `=password=${newPassword}`]);

        // Kick active session to force reconnect with new credentials (optional but recommended for PPPoE)
        const activeSessions = await conn.writeCommand('/ppp/active/print', [`?name=${customerInfo.username}`]);
        if (activeSessions.length > 0) {
            await conn.writeCommand('/ppp/active/remove', [`=.id=${activeSessions[0]['.id']}`]);
        }

        return NextResponse.json({ success: true, message: "WiFi password updated successfully" });

    } catch (error) {
        console.error("POST /api/client/wifi Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

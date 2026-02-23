import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Note: For MVP we will mock the remote VPN connection details since we don't 
// have an actual VPN Server integrated to create secrets yet. 

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Mocking returning VPN credentials that would theoretically 
        // be pulled natively from a FreeRadius or Mikrotik CHR VPN endpoint
        const mockedVpns = [
            { id: "vpn_1", username: "core_jkt", type: "L2TP/IPsec", serverIp: "103.111.99.2", localIp: "10.8.0.2", status: "CONNECTED", routerId: "1" },
            { id: "vpn_2", username: "hotspot_bali", type: "PPTP", serverIp: "103.111.99.3", localIp: "10.8.0.3", status: "DISCONNECTED", routerId: "2" },
        ];

        return NextResponse.json(mockedVpns);
    } catch (error) {
        console.error("Failed to fetch VPNs:", error);
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

        // Mock saving the VPN credential to a remote server
        const newVpn = {
            id: `vpn_${Math.random().toString(36).substr(2, 9)}`,
            username: data.username,
            type: data.type,
            serverIp: "103.111.99.X", // Mock Server IP
            localIp: "10.8.0.X", // Auto-assigned IP
            status: "DISCONNECTED",
            routerId: data.routerId
        };

        return NextResponse.json(newVpn, { status: 201 });
    } catch (error) {
        console.error("Failed to create VPN profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Only Tech Managers can assign
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "MANAGER_TECH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        if (!data.ticketId || !data.technicianId) {
            return NextResponse.json({ error: "Missing Target / Payload" }, { status: 400 });
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: data.ticketId, tenantId: session.user.tenantId },
            data: { assignedToId: data.technicianId }
        });

        return NextResponse.json(updatedTicket, { status: 200 });

    } catch (error) {
        console.error("Failed to assign ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

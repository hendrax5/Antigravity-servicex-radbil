import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Only Tech Managers can assign Installation Jobs
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== "MANAGER_TECH") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();

        if (!data.customerId || !data.technicianId) {
            return NextResponse.json({ error: "Missing Target / Payload" }, { status: 400 });
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: data.customerId, tenantId: session.user.tenantId },
            data: { technicianId: data.technicianId }
        });

        return NextResponse.json(updatedCustomer, { status: 200 });

    } catch (error) {
        console.error("Failed to assign installation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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

        const isTechSupport = session.user.role === "TECH_SUPPORT";
        const tickets = await prisma.ticket.findMany({
            where: {
                tenantId: session.user.tenantId,
                ...(isTechSupport ? { assignedToId: session.user.id } : {}) // Only see assigned cases if TECH_SUPPORT
            },
            include: {
                customer: { select: { name: true, phone: true } },
                assignedTo: { select: { id: true, name: true } }, // Expose assigned technician 
                messages: { orderBy: { createdAt: "asc" } }
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
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

        const newTicket = await prisma.ticket.create({
            data: {
                subject: data.subject,
                priority: data.priority || "NORMAL",
                status: "OPEN",
                customerId: data.customerId,
                tenantId: session.user.tenantId,
                messages: {
                    create: {
                        message: data.message,
                        senderType: "ADMIN",
                        senderId: session.user.id
                    }
                }
            },
            include: { customer: true, messages: true }
        });

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
        console.error("Failed to create ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

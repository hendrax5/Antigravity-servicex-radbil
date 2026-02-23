import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const customerId = session.user.id;

        const tickets = await prisma.ticket.findMany({
            where: { customerId },
            include: { messages: true, assignedTo: { select: { name: true } } },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== "CUSTOMER") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const customerId = session.user.id;
        const tenantId = (session.user as any).tenantId;
        const { subject, initialMessage } = await req.json();

        if (!subject || !initialMessage) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the Ticket and its first message
        const ticket = await prisma.ticket.create({
            data: {
                subject,
                status: "OPEN",
                priority: "NORMAL",
                customerId,
                tenantId,
                messages: {
                    create: {
                        message: initialMessage,
                        senderType: "CUSTOMER",
                        senderId: customerId
                    }
                }
            }
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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

        const invoices = await prisma.invoice.findMany({
            where: { customerId },
            orderBy: { dueDate: "desc" }
        });

        return NextResponse.json(invoices);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

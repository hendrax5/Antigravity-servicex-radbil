import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.tenantId || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            where: { tenantId: session.user.tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true
            }
        });

        // Add a mock status since we don't track status in DB right now
        const formattedUsers = users.map(u => ({ ...u, status: "ACTIVE" }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("GET /api/users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.tenantId || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, role, password } = body;

        if (!name || !email || !role || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Ideally here we would hash the password using bcryptjs.
        // But for MVP simple implementation matching next-auth authOptions comparison:
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password, // NOTE: plaintext used here explicitly for MVP based on existing NextAuth config
                tenantId: session.user.tenantId,
            }
        });

        return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } }, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/users Error:", error);
        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

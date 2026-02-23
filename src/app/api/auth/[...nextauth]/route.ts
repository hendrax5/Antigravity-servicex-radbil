import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs"; // Needs installation later if hashing, bypassing for simple demo

const prisma = new PrismaClient();

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@servicex.id" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                // 1. Try finding a system User (Admin, NOC, Sales, etc.) first
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { tenant: true },
                });

                if (user) {
                    const isPasswordValid = credentials.password === user.password;
                    if (!isPasswordValid) return null;

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role, // "ADMIN", "NOC", etc.
                        tenantId: user.tenantId,
                        tenantName: user.tenant.name,
                    };
                }

                // 2. If no System User, try finding a Customer (End User Portal)
                // Customers login with their username (often PPPoE username)
                const customer = await prisma.customer.findUnique({
                    where: { username: credentials.email },
                    include: { tenant: true }
                });

                if (customer) {
                    const isPasswordValid = credentials.password === customer.password;
                    if (!isPasswordValid) return null;

                    return {
                        id: customer.id,
                        email: customer.username, // mapping username to email for nextauth type safety
                        name: customer.name,
                        role: "CUSTOMER", // explicit role to route them strictly to /client
                        tenantId: customer.tenantId,
                        tenantName: customer.tenant.name,
                    };
                }

                // 3. User not found anywhere
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.tenantId = user.tenantId;
                token.tenantName = user.tenantName;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string;
                session.user.tenantName = token.tenantName as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-service-x-radbil-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

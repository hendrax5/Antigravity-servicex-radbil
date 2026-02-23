import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MikrotikService } from "@/lib/services/mikrotik";

const prisma = new PrismaClient();

// This endpoint receives webhooks from Moota.co when a bank mutation occurs
export async function POST(req: Request) {
    try {
        // Basic verification: Check for Moota specific headers or signature if needed
        // In production, you would verify the HMAC signature from Moota here.

        const data = await req.json();

        // Moota sends an array of mutations
        if (Array.isArray(data)) {
            for (const mutation of data) {
                // Only process credit (incoming funds)
                if (mutation.type === "CR") {
                    const amount = parseFloat(mutation.amount);

                    // We look for an UNPAID invoice where the total matches the exact unique amount.
                    // This relies on the fact that when generating invoices, they should have unique last 3 digits
                    // e.g. Rp 150.045
                    const matchingInvoice = await prisma.invoice.findFirst({
                        where: {
                            status: "UNPAID",
                            amount: amount,
                        },
                        include: {
                            customer: {
                                include: {
                                    plan: true,
                                    tenant: true
                                }
                            }
                        }
                    });

                    if (matchingInvoice) {
                        // Optional: Verify signature if provided in headers
                        // const signature = req.headers.get("x-moota-signature");
                        // if (matchingInvoice.customer.tenant.mootaSecret && signature) { ... verify ... }

                        // Mark Invoice as PAID
                        await prisma.invoice.update({
                            where: { id: matchingInvoice.id },
                            data: {
                                status: "PAID",
                                paidAt: new Date(),
                            }
                        });

                        // Update Customer status back to ACTIVE if they were ISOLIR
                        if (matchingInvoice.customer.status === "ISOLIR") {
                            await prisma.customer.update({
                                where: { id: matchingInvoice.customer.id },
                                data: { status: "ACTIVE" }
                            });

                            // Attempt to un-suspend them in MikroTik
                            const defaultRouter = await prisma.router.findFirst({
                                where: { tenantId: matchingInvoice.customer.tenantId }
                            });

                            if (defaultRouter) {
                                try {
                                    const mk = new MikrotikService(defaultRouter.ipAddress, defaultRouter.username, defaultRouter.password, defaultRouter.apiPort);
                                    const connected = await mk.connect();
                                    if (connected) {
                                        // Revert to their original service plan profile
                                        await mk.setPppoeProfile(matchingInvoice.customer.username, matchingInvoice.customer.plan?.name || "default");
                                        await mk.disconnect();
                                        console.log(`[Moota] Un-isolated customer ${matchingInvoice.customer.username} successfully.`);
                                    }
                                } catch (e) {
                                    console.error(`[Moota] Error un-isolating customer ${matchingInvoice.customer.username} on router.`, e);
                                }
                            }
                        }

                        console.log(`[Moota] Successfully processed payment for Invoice ID: ${matchingInvoice.id} via Amount: ${amount}`);

                    } else {
                        console.log(`[Moota] Mutation received but no matching UNPAID invoice found for Amount: ${amount}`);
                    }
                }
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Failed to process Moota webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

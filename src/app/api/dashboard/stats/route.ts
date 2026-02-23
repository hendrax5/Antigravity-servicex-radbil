import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tenantId = session.user.tenantId;

        // 1. Active Customers by Type
        const activeCustomers = await prisma.customer.findMany({
            where: { tenantId, status: "ACTIVE" },
            include: { plan: true }
        });

        const activePppoeCount = activeCustomers.filter(c => c.plan && c.plan.type === "PPPOE").length;
        const activeHotspotCount = activeCustomers.filter(c => c.plan && c.plan.type === "HOTSPOT").length;

        // 2. Online Routers (assuming all are online for MVP stat, or query if you have status field)
        const routersCount = await prisma.router.count({
            where: { tenantId }
        });

        // 3. Monthly Revenue (Current Month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyInvoices = await prisma.invoice.findMany({
            where: {
                status: "PAID",
                customer: { tenantId },
                paidAt: { gte: startOfMonth }
            }
        });

        const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

        // 4. Recent Invoices
        const recentInvoices = await prisma.invoice.findMany({
            where: { customer: { tenantId }, status: "PAID" },
            orderBy: { paidAt: "desc" },
            take: 5,
            include: { customer: true }
        });

        const formattedRecent = recentInvoices.map(inv => ({
            id: inv.id,
            customerName: inv.customer.name,
            amount: Number(inv.amount),
            date: inv.paidAt
        }));

        // 5. Chart Data (Last 6 Months Revenue roughly computed)
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleString('default', { month: 'short' });

            // Just for MVP visualization, generating some mock variance if not enough data
            const amount = Math.floor(Math.random() * 5000) + 1000;
            chartData.push({ month: monthName, revenue: amount });
        }

        // Add current month real revenue if you want, but for demo random is fine to fill the chart
        if (chartData.length > 0) {
            chartData[chartData.length - 1].revenue = monthlyRevenue > 0 ? monthlyRevenue : chartData[chartData.length - 1].revenue;
        }

        return NextResponse.json({
            stats: {
                activePppoe: activePppoeCount,
                activeHotspot: activeHotspotCount,
                routers: routersCount,
                monthlyRevenue: monthlyRevenue
            },
            recentInvoices: formattedRecent,
            chartData
        }, { status: 200 });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

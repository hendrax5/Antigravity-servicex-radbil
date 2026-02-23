import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// This endpoint receives incoming WhatsApp messages (via Webhook from Baileys / Waha / WABox etc)
export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Example Payload: { from: "62812345678", message: "!tagihan" }
        // Ensure "from" is stripped of special characters and @c.us suffix if any
        let sender = data.from?.replace(/\D/g, "");
        if (sender && sender.startsWith("0")) {
            sender = "62" + sender.substring(1);
        }

        const body = data.message?.trim().toLowerCase();

        if (!sender || !body) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        let replyMessage = "Maaf, perintah tidak dikenali. Ketik *!help* untuk bantuan.";

        // Interactive Bot Logic
        if (body === "!help") {
            replyMessage = `*ServiceX Bot Assistant*\n\nKetik perintah berikut:\n*!tagihan* - Cek tagihan internet\n*!gangguan [pesan]* - Lapor gangguan\n*!profil* - Cek info akun`;
        }
        else if (body === "!tagihan") {
            // Look up customer by phone
            // We search for phone using endsWith to handle country code variations loosely if needed, but exact is better
            const customer = await prisma.customer.findFirst({
                where: { phone: { contains: sender } },
                include: { invoices: { where: { status: "UNPAID" }, orderBy: { dueDate: 'asc' } } }
            });

            if (customer) {
                if (customer.invoices.length > 0) {
                    const inv = customer.invoices[0];
                    // Convert Prisma Decimal to number before formatter
                    const amountToFormat = typeof inv.amount === 'number' ? inv.amount : Number(inv.amount);
                    const amountFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amountToFormat);
                    replyMessage = `Halo *${customer.name}*,\n\nTagihan Anda bulan ini adalah *${amountFormatted}*\nJatuh tempo: *${new Date(inv.dueDate).toLocaleDateString("id-ID")}*\n\nSilakan lakukan pembayaran untuk menghindari isolir otomatis. Terima kasih!`;
                } else {
                    replyMessage = `Halo *${customer.name}*, tidak ada tagihan yang belum dibayar. Terima kasih telah tepat waktu!`;
                }
            } else {
                replyMessage = "Mohon maaf, nomor WhatsApp Anda tidak terdaftar dalam sistem kami. Silakan hubungi admin.";
            }
        }
        else if (body.startsWith("!gangguan")) {
            const complaintText = body.replace("!gangguan", "").trim();
            if (!complaintText) {
                replyMessage = "Silahkan sertakan detail gangguan.\n\nContoh:\n*!gangguan Internet mati sejak pagi, lampu PON kedap-kedip merah*";
            } else {
                const customer = await prisma.customer.findFirst({ where: { phone: { contains: sender } } });

                if (customer) {
                    // Create a support ticket automatically
                    const ticket = await prisma.ticket.create({
                        data: {
                            subject: "Laporan Gangguan via WhatsApp",
                            customerId: customer.id,
                            tenantId: customer.tenantId,
                            messages: {
                                create: {
                                    message: complaintText,
                                    senderType: "CUSTOMER",
                                    senderId: customer.id
                                }
                            }
                        }
                    });
                    replyMessage = `Terima kasih *${customer.name}*.\n\nLaporan gangguan Anda telah masuk ke tim support kami dengan *Tiket #${ticket.id.substring(0, 6).toUpperCase()}* dan akan segera ditangani teknisi kami. Mohon ditunggu ya!`;
                } else {
                    replyMessage = "Maaf, hanya pelanggan terdaftar yang dapat melaporkan gangguan via bot.";
                }
            }
        }
        else if (body === "!profil") {
            const customer = await prisma.customer.findFirst({
                where: { phone: { contains: sender } },
                include: { plan: true }
            });

            if (customer) {
                replyMessage = `*Profil Pelanggan*\n\nNama: ${customer.name}\nPaket: ${customer.plan?.name || 'Tidak ada'}\nStatus: ${customer.status === 'ACTIVE' ? '✅ Aktif' : '❌ ' + customer.status}`;
            } else {
                replyMessage = "Mohon maaf, nomor WhatsApp Anda tidak terdaftar dalam sistem kami.";
            }
        }

        // In a real implementation you would call the WhatsApp API provider again here to send `replyMessage`
        // e.g. await fetch("https://waha.domain.com/api/sendText", { body: JSON.stringify({ chatId: sender, text: replyMessage }) })

        console.log(`[WhatsApp Bot] Reply to ${sender}: ${replyMessage}`);

        return NextResponse.json({ success: true, reply: replyMessage }, { status: 200 });
    } catch (error) {
        console.error("Failed to process WhatsApp webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

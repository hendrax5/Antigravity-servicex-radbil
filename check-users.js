const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const customers = await prisma.customer.findMany({
        select: {
            username: true,
            password: true,
            email: true
        }
    });
    console.log("CUSTOMERS:", customers);

    const users = await prisma.user.findMany({
        select: {
            name: true,
            email: true,
            role: true
        }
    });
    console.log("SYSTEM USERS:", users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

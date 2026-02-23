import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding initial data...')

    const tenant = await prisma.tenant.upsert({
        where: { domain: 'servicex.id' },
        update: {},
        create: {
            name: 'ServiceX Admin',
            domain: 'servicex.id',
        },
    })

    const admin = await prisma.user.upsert({
        where: { email: 'admin@servicex.id' },
        update: {},
        create: {
            email: 'admin@servicex.id',
            password: 'password123', // Demo password
            name: 'Super Admin',
            role: 'ADMIN',
            tenantId: tenant.id,
        },
    })

    console.log({ tenant, admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

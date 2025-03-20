import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function setupDatabase() {
  console.log('Setting up database...')

  try {
    // Run Prisma migration
    console.log('Running Prisma migration...')
    await execAsync('npx prisma migrate dev --name init')

    console.log('Migration complete!')

    // Test database connection
    console.log('Testing database connection...')
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('Connected to database successfully!')

    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: '$2a$10$GmQ5N.nf3t4yv.ql9ixSLOkaZ.lvZJMrE7jwIt.lf9tVCxgxO0XHa', // hashed 'password123'
        role: 'BUYER'
      }
    })

    console.log('Test user created:', testUser)

    await prisma.$disconnect()
    console.log('Setup complete!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase()

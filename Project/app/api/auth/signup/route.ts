import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Create a new PrismaClient instance for each request
const prisma = new PrismaClient()

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log("Signup API called")
  try {
    const body = await request.json()
    console.log("Request body:", body)
    const { name, email, password } = body

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
        // password: hashedPassword 
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 })
    }

    // Hash the password

    console.log("Creating user with data:", {
      name,
      email,
      role: "BUYER"
    })

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "BUYER",
      },
    })

    console.log("User created:", user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({
      message: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

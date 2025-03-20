import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import  authOptions  from "@/pages/api/auth/[...nextauth]" // Adjust path if needed

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    return NextResponse.json({ 
      authenticated: true,
      session: session
    })
  }
  
  return NextResponse.json({ 
    authenticated: false,
    message: "Not authenticated" 
  }, { status: 401 })
}
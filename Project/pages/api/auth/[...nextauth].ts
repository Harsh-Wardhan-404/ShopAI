import NextAuth from "next-auth"
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


// export default NextAuth({
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code"
//         }
//       }
//     }),],
//   callbacks: {
//     async session({ session, user }) {
//       if (session.user) {
//         //@ts-ignore
//         session.user.id = user.id;
//         // Add role if available
//         const dbUser = await prisma.user.findUnique({
//           where: { email: user.email! }
//         });
//         if (dbUser) {
//           //@ts-ignore
//           session.user.role = dbUser.role;
//         }
//         console.log("session", session)
//       }
//       return session;
//     }
//   },
//   pages: {
//     signIn: "/", // Use your own login page
//   },
//   debug: process.env.NODE_ENV === "development",

// });

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),],
  callbacks: {
    //@ts-ignore
    async session({ session, user }) {
      if (session.user) {
        //@ts-ignore
        session.user.id = user.id;
        console.log("session.user.id", session.user.id);
        console.log("session.user.email", session.user.email);
        // Add role if available
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        if (dbUser) {
          //@ts-ignore
          session.user.role = dbUser.role;
        }
        console.log("session", session)
      }
      return session;
    }
  },
  pages: {
    signIn: "/", // Use your own login page
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

// export const GET = handler;
// export const POST = handler;

// import { handlers } from "@/auth"
// export const { GET, POST } = handlers
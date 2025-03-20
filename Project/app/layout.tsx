import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { SessionProvider } from "next-auth/react"
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'shop.ai - Sustainable E-commerce',
  description: 'AI-powered sustainable shopping experience',
};

export default function RootLayout({
  children, session
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (

    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Header />

                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
        <Toaster />
      </body>
    </html >


  );
}
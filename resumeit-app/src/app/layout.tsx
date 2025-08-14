import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/context/AuthContext'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'ResumeIT - AI-Powered Recruitment Platform',
  description: 'Transform your recruitment process with intelligent candidate matching and resume analysis powered by advanced AI technology.',
  keywords: 'recruitment, resume analysis, candidate matching, job portal, talent acquisition, AI recruitment',
  icons: {
    icon: '/images/resumeit-ai-logo.svg',
    shortcut: '/images/resumeit-ai-logo.svg',
    apple: '/images/resumeit-ai-logo.svg',
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen relative z-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

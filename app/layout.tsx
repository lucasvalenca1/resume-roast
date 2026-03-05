import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://resume-roast.abacus.ai'),
  title: 'Resume Roast - AI-Powered Resume Analysis',
  description: 'Get your resume roasted by AI. Receive honest, actionable feedback to improve your resume and land your dream job.',
  keywords: ['resume', 'cv', 'roast', 'feedback', 'AI', 'career', 'job search', 'analysis'],
  authors: [{ name: 'Resume Roast' }],
  openGraph: {
    title: 'Resume Roast - AI-Powered Resume Analysis',
    description: 'Get your resume roasted by AI. Receive honest, actionable feedback to improve your resume and land your dream job.',
    url: '/',
    siteName: 'Resume Roast',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Resume Roast'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Roast - AI-Powered Resume Analysis',
    description: 'Get your resume roasted by AI. Receive honest, actionable feedback.',
    images: ['/og-image.png']
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

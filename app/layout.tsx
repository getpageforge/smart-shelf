import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { UserProvider } from '@/lib/contexts/user-context'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import './globals.css'
import { UserProfileProvider } from '@/lib/contexts/user-profile-context'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Smart Shelf | Painel de Gestão',
  description:
    'Painel de controle da Smart Shelf — estação inteligente de devolução de produtos para supermercados.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f1117',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark bg-background ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <UserProfileProvider>
          <OnboardingWizard />
          {children}
        </UserProfileProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ClientLayoutWrapper from '@/features/wrapper/ClientLayoutWrapper'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'WatchParty',
  description: 'Stream together, watch together',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white`}
      >
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <div id="livekit-audio-container" className="hidden" />
      </body>
    </html>
  )
}

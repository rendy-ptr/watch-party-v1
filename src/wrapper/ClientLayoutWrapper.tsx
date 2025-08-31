'use client'

import { ReactNode } from 'react'
import Header from '@/components/Header'
import { Toaster } from 'sonner'

export default function ClientLayoutWrapper({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Toaster position="top-right" richColors />
    </>
  )
}

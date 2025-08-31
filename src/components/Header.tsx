'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth, signInWithGooglePopup } from '@/lib/firebase'
import Image from 'next/image'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('[Header] Auth state changed:', u)
      setUser(u)
    })
    return () => unsub()
  }, [])

  const handleLogin = async () => {
    console.log('[Header] Login clicked')
    const loggedUser = await signInWithGooglePopup()
    console.log('[Header] Login result:', loggedUser)
    if (loggedUser) setUser(loggedUser)
  }

  const handleLogout = async () => {
    console.log('[Header] Logout clicked')
    await signOut(auth)
    setUser(null)
    router.push('/')
  }

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="cursor-pointer" onClick={() => router.push('/')}>
        🎬 WatchParty
      </h1>
      <div>
        {user ? (
          <div className="flex items-center gap-3">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                width={32}
                height={32}
                className="rounded-full"
                alt="User"
              />
            )}
            <span>{user.displayName || 'Guest'}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-blue-600 px-3 py-1 rounded"
          >
            Login
          </button>
        )}
      </div>
    </header>
  )
}

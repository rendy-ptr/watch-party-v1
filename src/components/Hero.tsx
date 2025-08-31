'use client'

import { Play, Github } from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
export default function WatchPartyHero() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsub()
  }, [])

  if (user === undefined) {
    return (
      <AnimatedBackground>
        <div className="flex items-center justify-center min-h-screen text-white">
          Checking authentication...
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 font-mono mb-4 tracking-wider">
            WATCH
          </h1>
          <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-mono tracking-wider">
            PARTY
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mb-16">
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide opacity-80 hover:opacity-100 transition-opacity duration-300">
            Stream together, watch together
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Link href="/content">
            <button className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-2xl shadow-blue-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 overflow-hidden">
              <div className="relative flex items-center gap-3">
                <Play className="w-5 h-5 group-hover:animate-pulse" />
                Get Started
              </div>
            </button>
          </Link>

          <a
            href="https://github.com/rendy-ptr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="group relative px-10 py-4 bg-slate-800/50 text-gray-300 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-gray-700 hover:border-gray-500 overflow-hidden">
              <div className="relative flex items-center gap-3">
                <Github className="w-5 h-5 group-hover:animate-bounce" />
                View Source
              </div>
            </button>
          </a>
        </div>
      </div>
    </AnimatedBackground>
  )
}

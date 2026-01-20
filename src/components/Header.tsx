'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  auth,
  loginWithGoogle,
  handleRedirectResult,
  logout,
} from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Image from 'next/image'
import { toast } from 'sonner'
import type { User } from 'firebase/auth'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Cek user aktif
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))

    // Handle login via redirect
    handleRedirectResult().then((u) => {
      if (u) setUser(u)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await loginWithGoogle()
      if (result?.user) {
        toast.success(`Welcome, ${result.user.displayName || 'Guest'}!`)
        setUser(result.user)
      }
    } catch (err) {
      console.error('Login gagal:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      toast.success('You have been logged out.', {
        description: 'See you again!',
      })
      router.push('/')
    } catch (err) {
      console.error('Logout gagal:', err)
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes logoGlow {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
          50% {
            text-shadow: 0 0 30px rgba(130, 199, 255, 0.8);
          }
        }
        @keyframes shimmerButton {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .logo-glow {
          animation: logoGlow 3s ease-in-out infinite;
        }
        .fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmerButton 2s infinite;
        }
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 640px) {
          .logo-glow {
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
          }
          .shimmer-effect::before {
            animation: shimmerButton 1.5s infinite;
          }
        }
      `}</style>

      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="w-full px-6 sm:px-10 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-3 sm:gap-0">
            {/* Logo */}
            <div
              className="cursor-pointer logo-glow transition-transform hover:scale-105"
              onClick={() => router.push('/')}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-white/20 to-cyan-200/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-xl sm:text-2xl">🎬</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Watch Party
                </h1>
              </div>
            </div>

            {/* User Section */}
            <div className="fade-in-down">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* User Profile */}
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-lg rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
                    {user.photoURL && (
                      <div className="relative">
                        <Image
                          src={user.photoURL}
                          width={24}
                          height={24}
                          className="rounded-full border-2 border-white/30 sm:w-8 sm:h-8"
                          alt="User"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                    )}
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {user.displayName || 'Guest'}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="group relative bg-gradient-to-r from-red-500/80 to-pink-500/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-white font-medium text-xs sm:text-sm border border-red-400/20 hover:from-red-500 hover:to-pink-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105"
                  >
                    <span className="relative z-10">Logout</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="group relative shimmer-effect bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 rounded-full text-white font-semibold text-xs sm:text-sm border border-blue-400/20 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                    {isLoading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full loading-spinner"></div>
                    ) : (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    {isLoading ? 'Signing in...' : 'Login with Google'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}

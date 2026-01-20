'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimatedBackground from '@/components/AnimatedBackground'
import styles from './style/hero.module.css'

export default function WatchPartyHero() {
  const [typedText, setTypedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()

  const texts = [
    'Watch Together',
    'Share Moments',
    'Create Memories',
    'Connect Globally',
  ]
  const currentText = texts[currentIndex]

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (typedText.length < currentText.length) {
      timeout = setTimeout(() => {
        setTypedText(currentText.slice(0, typedText.length + 1))
      }, 100)
    } else {
      timeout = setTimeout(() => {
        setTypedText('')
        setCurrentIndex((prev) => (prev + 1) % texts.length)
      }, 2000)
    }

    return () => clearTimeout(timeout)
  }, [typedText, currentText, texts.length])

  return (
    <AnimatedBackground>
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Title */}
          <div className={`${styles.fadeInUp} mb-8`}>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              <span className={styles.gradientText}>Watch Party</span>
            </h1>
            <div className="text-2xl md:text-4xl text-white/90 mb-2">
              <span>{typedText}</span>
              <span className={`${styles.typingCursor} text-cyan-300`}>|</span>
            </div>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Experience movies and shows together with friends, no matter where
              you are. Synchronized viewing, real-time chat, and shared
              emotions.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`${styles.scaleIn} flex flex-col sm:flex-row gap-4 justify-center mb-16`}
          >
            <button
              onClick={() => router.push('/platform')}
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 rounded-full text-white font-semibold text-lg border border-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Party
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={() => router.push('/join-room')}
              className={`group relative ${styles.glassCard} px-8 py-4 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Join Party
              </span>
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div
              className={`${styles.featureCard} ${styles.glassCard} p-6 rounded-2xl transition-all duration-300 hover:bg-white/15`}
            >
              <div className={`${styles.floatAnimation} mb-4`}>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Synchronized Playback
              </h3>
              <p className="text-white/70">
                Watch in perfect sync with your friends. Play, pause, and seek
                together in real-time.
              </p>
            </div>

            <div
              className={`${styles.featureCard} ${styles.glassCard} p-6 rounded-2xl transition-all duration-300 hover:bg-white/15`}
            >
              <div
                className={`${styles.floatAnimation} mb-4`}
                style={{ animationDelay: '1s' }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Live Chat
              </h3>
              <p className="text-white/70">
                Share reactions and discuss scenes as they happen with
                integrated chat features.
              </p>
            </div>

            <div
              className={`${styles.featureCard} ${styles.glassCard} p-6 rounded-2xl transition-all duration-300 hover:bg-white/15`}
            >
              <div
                className={`${styles.floatAnimation} mb-4`}
                style={{ animationDelay: '2s' }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Global Access
              </h3>
              <p className="text-white/70">
                Connect with friends anywhere in the world. No geographical
                limitations.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-16 text-center">
            <div className={`${styles.glassCard} px-4 sm:px-6 py-4 rounded-xl`}>
              <div className="text-xl sm:text-2xl font-bold text-white">
                10K+
              </div>
              <div className="text-white/70 text-xs sm:text-sm">
                Active Users
              </div>
            </div>
            <div className={`${styles.glassCard} px-4 sm:px-6 py-4 rounded-xl`}>
              <div className="text-xl sm:text-2xl font-bold text-white">
                50K+
              </div>
              <div className="text-white/70 text-xs sm:text-sm">
                Watch Parties
              </div>
            </div>
            <div className={`${styles.glassCard} px-4 sm:px-6 py-4 rounded-xl`}>
              <div className="text-xl sm:text-2xl font-bold text-white">
                99.9%
              </div>
              <div className="text-white/70 text-xs sm:text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  )
}

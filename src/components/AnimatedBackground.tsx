'use client'

import React from 'react'
import { BACKGROUND_STYLES } from '@/constant/style'

interface AnimatedBackgroundProps {
  children: React.ReactNode
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
}) => {
  return (
    <>
      <style jsx>{`
        @keyframes glow {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
          50% {
            text-shadow: 0 0 40px rgba(147, 197, 253, 0.8); // Sesuai sky-300
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>

      <div className={BACKGROUND_STYLES.container}>
        <div
          className="absolute inset-0"
          style={BACKGROUND_STYLES.gridPattern}
        />

        <div
          className={BACKGROUND_STYLES.ambientOrbs[0]}
          style={{ animationDuration: '4s' }}
        />
        <div
          className={BACKGROUND_STYLES.ambientOrbs[1]}
          style={{ animationDuration: '6s' }}
        />
        <div
          className={BACKGROUND_STYLES.ambientOrbs[2]}
          style={{ animationDelay: '2s', animationDuration: '5s' }}
        />

        <div className={BACKGROUND_STYLES.bottomGlow} />

        <div className="relative z-10">{children}</div>
      </div>
    </>
  )
}

export default AnimatedBackground

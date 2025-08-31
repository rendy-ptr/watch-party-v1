'use client'

import React, { useState, useEffect } from 'react'
import { BACKGROUND_STYLES } from '@/constant/style'
import type { Meteor, Particle } from '@/types/type'

interface AnimatedBackgroundProps {
  children: React.ReactNode
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
}) => {
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateMeteors = (): void => {
      const newMeteors: Meteor[] = []
      for (let i = 0; i < 6; i++) {
        newMeteors.push({
          id: i,
          left: Math.random() * 100,
          animationDelay: Math.random() * 5,
          animationDuration: 2 + Math.random() * 3,
        })
      }
      setMeteors(newMeteors)
    }

    const generateParticles = (): void => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 2 + 1,
          animationDelay: Math.random() * 10,
          animationDuration: 3 + Math.random() * 7,
        })
      }
      setParticles(newParticles)
    }

    generateMeteors()
    generateParticles()

    const meteorInterval = setInterval(generateMeteors, 8000)
    return () => clearInterval(meteorInterval)
  }, [])

  const Meteor: React.FC<{ meteor: Meteor }> = ({ meteor }) => (
    <div
      className="absolute w-0.5 h-16 bg-gradient-to-b from-blue-400 via-purple-400 to-transparent rounded-full opacity-60"
      style={{
        left: `${meteor.left}%`,
        top: '-64px',
        animationName: 'meteorFall',
        animationDuration: `${meteor.animationDuration}s`,
        animationDelay: `${meteor.animationDelay}s`,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    />
  )

  const Particle: React.FC<{ particle: Particle }> = ({ particle }) => (
    <div
      className="absolute rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-40"
      style={{
        left: `${particle.left}%`,
        top: `${particle.top}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        animationName: 'particleFloat',
        animationDuration: `${particle.animationDuration}s`,
        animationDelay: `${particle.animationDelay}s`,
        animationIterationCount: 'infinite',
        animationDirection: 'alternate',
        animationTimingFunction: 'ease-in-out',
      }}
    />
  )

  return (
    <>
      <style jsx>{`
        @keyframes meteorFall {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(30px);
            opacity: 0;
          }
        }
        @keyframes particleFloat {
          0% {
            transform: translateY(0px);
            opacity: 0.2;
          }
          100% {
            transform: translateY(-15px);
            opacity: 0.6;
          }
        }
        @keyframes glow {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
          }
          50% {
            text-shadow: 0 0 40px rgba(147, 51, 234, 0.8);
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
          className="absolute inset-0 opacity-5"
          style={BACKGROUND_STYLES.gridPattern}
        />

        <div className="absolute inset-0">
          {meteors.map((meteor) => (
            <Meteor key={meteor.id} meteor={meteor} />
          ))}
        </div>

        <div className="absolute inset-0">
          {particles.map((particle) => (
            <Particle key={particle.id} particle={particle} />
          ))}
        </div>

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
          style={{ animationDuration: '5s' }}
        />

        <div className={BACKGROUND_STYLES.bottomGlow} />

        <div className="relative z-10">{children}</div>
      </div>
    </>
  )
}

export default AnimatedBackground

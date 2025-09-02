'use client'
import type { Platform } from '../types/platform'
import styles from '../style/platform.module.css'

interface PlatformCardProps {
  platform: Platform
  onClick: (platform: Platform) => void
}

const PlatformCard = ({ platform, onClick }: PlatformCardProps) => {
  const Icon = platform.icon

  return (
    <div
      onClick={() => platform.isActive && onClick(platform)}
      className={`
        relative
        ${styles.featureCard} ${styles.glassCard}
        p-6 rounded-2xl transition-all duration-300
        ${platform.isActive ? 'cursor-pointer hover:bg-white/15' : 'opacity-50'}
      `}
    >
      {/* Icon wrapper */}
      <div
        className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4
          bg-gradient-to-r ${platform.color}
          ${platform.isActive ? styles.floatAnimation : ''}
        `}
        style={platform.isActive ? { animationDelay: '2s' } : {}}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Title & description */}
      <h3 className="text-xl font-semibold text-white mb-2 text-center">
        {platform.name}
      </h3>
      <p className="text-white/70 text-center">{platform.description}</p>

      {/* Overlay jika tidak aktif */}
      {!platform.isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl px-4 py-1 border border-white/20 shadow-2xl">
            <span className="relative text-white font-bold text-sm tracking-wide">
              Coming Soon
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlatformCard

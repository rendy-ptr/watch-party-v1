'use client'
import type { Platform } from '../types/platform'
import { platforms } from '../mocks/platform'
import PlatformCard from '../organisms/PlatformCard'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const PlatformSection = () => {
  const router = useRouter()
  const handlePlatformClick = (platform: Platform) => {
    console.log('Selected platform:', platform)
    const targetUrl = `${platform.url}/create`
    router.push(targetUrl)
    toast.success(`Navigating to ${platform.name} setup...`)
  }

  return (
    <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Choose Your Platform
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Select a platform to continue. More platforms coming soon!
          </p>
        </div>

        {/* Platform Cards - Single row for desktop, Column for mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-16">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onClick={handlePlatformClick}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            More platforms will be available soon. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlatformSection

'use client'
import CustomInput from '@/components/CustomInput'
import { Maximize, Minimize, Star } from 'lucide-react'
import SyncedYoutubePlayer from '../organisms/YoutubePlayer'
import { useRef, useState, useEffect } from 'react'
import '../style/youtube-room.module.css'

interface VideoYoutubeRoomProps {
  id: string
  youtubeUrl: string
  setYoutubeUrl: (url: string) => void
  isMuted: boolean
  isOwner: boolean
}

const VideoYoutubeRoom = ({
  id,
  youtubeUrl,
  setYoutubeUrl,
  isMuted,
  isOwner,
}: VideoYoutubeRoomProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreen = () => {
    if (!containerRef.current) return
    const el = containerRef.current

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen().catch((err) => {
        console.error('Fullscreen error:', err)
      })
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Add all browser-specific event listeners
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]

    events.forEach((event) => {
      document.addEventListener(event, handleFullscreenChange)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFullscreenChange)
      })
    }
  }, [])

  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  return (
    <div
      className={`xl:col-span-3 transition-all duration-300 ease-in-out ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black flex items-center justify-center'
          : ''
      }`}
      ref={containerRef}
    >
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${
            isFullscreen
              ? 'w-full h-full bg-transparent p-0 border-0 rounded-none shadow-none backdrop-blur-none'
              : 'bg-black/20 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20'
          }
        `}
      >
        <div
          className={`
            relative overflow-hidden bg-black transition-all duration-300 ease-in-out
            ${
              isFullscreen
                ? 'w-full h-full rounded-none'
                : 'rounded-xl aspect-video'
            }
          `}
        >
          <SyncedYoutubePlayer
            roomId={id}
            isOwner={isOwner}
            isMuted={isMuted}
          />

          <button
            className={`
              absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 z-30
              ${
                isFullscreen
                  ? 'bg-black/70 hover:bg-black/90'
                  : 'bg-black/50 hover:bg-black/70'
              }
            `}
            onClick={handleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-white" />
            ) : (
              <Maximize className="h-5 w-5 text-white" />
            )}
          </button>
        </div>

        {/* Video Controls/Info - Hide in fullscreen */}
        {!isFullscreen && (
          <>
            <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-white/80 text-sm">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span>Room ID: {id}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col lg:flex-row gap-4">
              <CustomInput
                className="w-full lg:w-[70%]"
                placeholder="Paste a New YouTube URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />

              <button
                className="w-full lg:w-[30%] p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                disabled={!isOwner}
                title={
                  !isOwner
                    ? 'Only room owner can change video'
                    : 'Change video URL'
                }
              >
                Set Video
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VideoYoutubeRoom

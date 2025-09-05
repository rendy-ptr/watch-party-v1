'use client'
import {
  Crown,
  Maximize,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
} from 'lucide-react'
import OnlineUsers from '../organisms/OnlineUsers'
import { useYoutubeRoomStore } from '@/store/youtubeRoomStore'

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
  msRequestFullscreen?: () => Promise<void> | void
  mozRequestFullScreen?: () => Promise<void> | void
  fullscreenElement?: () => Promise<void> | void
  webkitIsFullScreen?: () => Promise<void> | void
  mozFullScreen?: () => Promise<void> | void
  webkitEnterFullscreen?: () => Promise<void> | void
}

const HeaderYoutubeRoom = () => {
  const {
    roomId,
    isMuted,
    toggleMute,
    isMicOff,
    toggleMic,
    isHeadphonesOff,
    toggleHeadphones,
  } = useYoutubeRoomStore()

  const handleFullscreen = () => {
    const container = document.getElementById(
      `youtube-container-${roomId}`,
    ) as FullscreenElement | null
    if (!container) return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
      // iOS fullscreen khusus (video element langsung)
      if (container.webkitEnterFullscreen) container.webkitEnterFullscreen()
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen()
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen()
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen()
    }
  }

  return (
    <div className="max-w-7xl mx-auto mb-6 relative z-30">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-xl border border-white/20 relative overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-400" />
              <h1 className="text-lg lg:text-3xl font-bold text-white">
                Premium Room {roomId}
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Live</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 relative">
            <div className="relative z-50">
              <OnlineUsers />
            </div>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Fullscreen */}
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              onClick={handleFullscreen}
            >
              <Maximize className="h-5 w-5 text-white" />
            </button>

            {/* Mic */}
            <button
              onClick={toggleMic}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMicOff ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Headphones) */}
            <button
              onClick={toggleHeadphones}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isHeadphonesOff ? (
                <HeadphoneOff className="h-5 w-5 text-white" />
              ) : (
                <Headphones className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderYoutubeRoom

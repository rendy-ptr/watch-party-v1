'use client'
import { Crown, Maximize, Volume2, VolumeX } from 'lucide-react'
import OnlineUsers from '../organisms/OnlineUsers'
import { User } from '@/types/users'

interface HeaderYoutubeRoomProps {
  roomId: string
  onlineUsers: number
  onlineUsersList: User[]
  isMuted: boolean
  toggleMute: () => void
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
  msRequestFullscreen?: () => Promise<void> | void
  mozRequestFullScreen?: () => Promise<void> | void
  fullscreenElement?: () => Promise<void> | void
  webkitIsFullScreen?: () => Promise<void> | void
  mozFullScreen?: () => Promise<void> | void
  webkitEnterFullscreen?: () => Promise<void> | void
}

const HeaderYoutubeRoom = ({
  roomId,
  onlineUsers,
  onlineUsersList,
  isMuted,
  toggleMute,
}: HeaderYoutubeRoomProps) => {
  const handleFullscreen = () => {
    const container = document.getElementById(
      `youtube-container-${roomId}`,
    ) as FullscreenElement | null
    if (!container) return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen()
    } else if (container.webkitEnterFullscreen) {
      container.webkitEnterFullscreen()
    } else if (container.webkitIsFullScreen) {
      container.webkitIsFullScreen()
    } else if (container.mozFullScreen) {
      container.mozFullScreen()
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

          {/* Controls container with proper overflow handling */}
          <div className="flex items-center gap-4 relative">
            {/* OnlineUsers with static positioning to prevent overflow issues */}
            <div className="relative z-50">
              <OnlineUsers
                onlineUsers={onlineUsers}
                onlineUsersList={onlineUsersList}
              />
            </div>
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
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              onClick={handleFullscreen}
            >
              <Maximize className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HeaderYoutubeRoom

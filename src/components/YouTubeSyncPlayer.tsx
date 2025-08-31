'use client'

import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import { useEffect, useRef, useState } from 'react'
import type { PlayerState } from '@/types/type'

interface YouTubeSyncPlayerProps {
  roomId: string
  videoId?: string
  myId: string
  ownerId: string | null
  state: PlayerState
  onRemoteControl: (next: { playing: boolean }) => Promise<void>
}

export default function YouTubeSyncPlayer({
  videoId,
  state,
  myId,
  ownerId,
  onRemoteControl,
}: YouTubeSyncPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playerError, setPlayerError] = useState(false)
  const [isOwnerBuffering, setIsOwnerBuffering] = useState(false)

  const isOwner = myId === ownerId

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target
    setIsLoading(false)
    setPlayerError(false)
  }

  const onError = () => {
    setPlayerError(true)
    setIsLoading(false)
  }

  const onStateChange = async (event: YouTubeEvent) => {
    if (!playerRef.current || !isOwner) return
    const playerState = event.data

    try {
      if (playerState === 1) {
        setIsOwnerBuffering(false)
        await onRemoteControl({ playing: true })
      } else if (playerState === 2) {
        await onRemoteControl({ playing: false })
      } else if (playerState === 3) {
        setIsOwnerBuffering(true)
        await onRemoteControl({ playing: false })
      }
    } catch (err) {
      console.error('Error syncing owner state:', err)
    }
  }

  useEffect(() => {
    if (!playerRef.current || isOwner) return
    const player = playerRef.current
    const playing = Boolean(state.playing)

    const sync = async () => {
      const currentState = await player.getPlayerState()
      if (playing && currentState !== 1) {
        await player.playVideo()
      }
      if (!playing && currentState === 1) {
        await player.pauseVideo()
      }
    }

    sync()
  }, [state.playing, isOwner])

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-black/40 border border-white/10 flex flex-col items-center justify-center p-8 rounded-2xl backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-3">
          No Video Selected
        </h3>
        <p className="text-slate-400 max-w-md leading-relaxed text-center">
          Paste a YouTube URL below to start watching together!
        </p>
      </div>
    )
  }

  return (
    <div className="w-full aspect-video relative rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-white font-bold text-lg">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {playerError && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20 p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Video Error</h3>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Failed to load video.
            </p>
          </div>
        </div>
      )}

      {/* Sync status */}
      <div className="absolute top-4 right-4 z-30">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-xl border border-white/20">
          <div
            className={`w-3 h-3 rounded-full ${
              state.playing
                ? 'bg-green-500 animate-pulse shadow-green-500/50 shadow-lg'
                : 'bg-red-500 shadow-red-500/50 shadow-lg'
            }`}
          />
          <span className="text-sm text-white font-bold">
            {state.playing ? 'LIVE' : isOwnerBuffering ? 'BUFFERING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* YouTube Player */}
      <YouTube
        videoId={videoId}
        opts={{
          playerVars: {
            autoplay: 0,
            controls: isOwner ? 1 : 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
          },
        }}
        onReady={onReady}
        onError={onError}
        onStateChange={onStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-2xl"
      />

      {!isOwner && (
        <div
          className="absolute inset-0 z-40 bg-transparent pointer-events-none"
          title="Only the owner can control playback"
        />
      )}
    </div>
  )
}

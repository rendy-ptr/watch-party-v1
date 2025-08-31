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

    // Untuk non-owner, disable semua keyboard shortcuts
    if (!isOwner && playerRef.current) {
      try {
        const iframe = document.querySelector(
          'iframe[src*="youtube"]',
        ) as HTMLIFrameElement
        if (iframe) {
          iframe.style.pointerEvents = 'none'
          // Re-enable pointer events hanya untuk fullscreen button
          iframe.addEventListener('dblclick', (e) => {
            e.preventDefault()
            e.stopPropagation()
          })
        }
      } catch (err) {
        console.error('Error setting iframe restrictions:', err)
      }
    }
  }

  const onError = () => {
    setPlayerError(true)
    setIsLoading(false)
  }

  const onStateChange = async (event: YouTubeEvent) => {
    if (!playerRef.current || !isOwner) return
    const playerState = event.data

    try {
      // Owner mengontrol state untuk semua viewer
      if (playerState === 1) {
        // Playing
        setIsOwnerBuffering(false)
        console.log('Owner: Broadcasting play state to all viewers')
        await onRemoteControl({ playing: true })
      } else if (playerState === 2) {
        // Paused
        console.log('Owner: Broadcasting pause state to all viewers')
        await onRemoteControl({ playing: false })
      } else if (playerState === 3) {
        // Buffering
        setIsOwnerBuffering(true)
        console.log('Owner: Broadcasting buffering state to all viewers')
        await onRemoteControl({ playing: false })
      }
    } catch (err) {
      console.error('Error syncing owner state:', err)
    }
  }

  // Sinkronisasi untuk viewer - hanya mengikuti play/pause dari owner
  useEffect(() => {
    if (!playerRef.current || isOwner) return
    const player = playerRef.current
    const playing = Boolean(state.playing)

    const sync = async () => {
      try {
        const currentState = await player.getPlayerState()

        // Jika owner play, viewer harus play juga
        if (playing && currentState !== 1) {
          console.log('Viewer: Following owner - playing video')
          await player.playVideo()
        }

        // Jika owner pause, viewer harus pause juga
        if (!playing && currentState === 1) {
          console.log('Viewer: Following owner - pausing video')
          await player.pauseVideo()
        }
      } catch (err) {
        console.error('Error syncing viewer with owner:', err)
      }
    }

    sync()
  }, [state.playing, isOwner])

  // Handle keyboard events untuk non-owner
  useEffect(() => {
    if (isOwner) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common YouTube keyboard shortcuts untuk non-owner
      const disabledKeys = [
        'Space',
        'KeyK',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'KeyJ',
        'KeyL',
        'KeyM',
        'Digit0',
        'Digit1',
        'Digit2',
        'Digit3',
        'Digit4',
        'Digit5',
        'Digit6',
        'Digit7',
        'Digit8',
        'Digit9',
        'Period',
        'Comma',
        'Home',
        'End',
      ]

      if (
        disabledKeys.includes(e.code) &&
        document.activeElement?.tagName === 'IFRAME'
      ) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isOwner])

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

      {/* Owner/Non-owner indicator */}
      <div className="absolute top-4 left-4 z-30">
        <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg border border-white/20">
          <span
            className={`text-xs font-bold ${
              isOwner ? 'text-green-400' : 'text-blue-400'
            }`}
          >
            {isOwner ? 'OWNER' : 'VIEWER'}
          </span>
        </div>
      </div>

      {/* YouTube Player */}
      <YouTube
        videoId={videoId}
        opts={{
          playerVars: {
            autoplay: 0,
            controls: isOwner ? 1 : 0, // Non-owner tidak memiliki controls
            disablekb: isOwner ? 0 : 1, // Disable keyboard untuk non-owner
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
            fs: 1, // Tetap izinkan fullscreen untuk semua
            playsinline: 1,
            // Tambahan parameter untuk membatasi interaksi non-owner
            cc_load_policy: 0, // Disable closed captions control
            color: 'white',
            enablejsapi: 1,
          },
        }}
        onReady={onReady}
        onError={onError}
        onStateChange={onStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full rounded-2xl"
      />

      {/* Overlay untuk non-owner - mencegah interaksi tetapi izinkan fullscreen */}
      {!isOwner && (
        <>
          {/* Overlay transparan yang mencegah klik di area player */}
          <div
            className="absolute inset-0 z-10 bg-transparent"
            style={{ pointerEvents: 'auto' }}
            onMouseDown={(e) => e.preventDefault()}
            onMouseUp={(e) => e.preventDefault()}
            onClick={(e) => e.preventDefault()}
            onDoubleClick={(e) => e.preventDefault()}
            title="Only the owner can control playback. Double-click or press F to fullscreen."
          />

          {/* Custom fullscreen button untuk non-owner */}
          <button
            onClick={() => {
              const iframe = document.querySelector(
                'iframe[src*="youtube"]',
              ) as HTMLIFrameElement
              if (iframe && iframe.requestFullscreen) {
                iframe.requestFullscreen()
              }
            }}
            className="absolute bottom-4 right-4 z-20 p-2 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-200 hover:scale-110"
            title="Fullscreen"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

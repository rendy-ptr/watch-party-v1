'use client'
import React, { useEffect, useRef, useState } from 'react'
import YouTube, { YouTubeEvent } from 'react-youtube'
import { getDatabase, ref, onValue, set } from 'firebase/database'
import { auth } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'

type Action = 'init' | 'play' | 'pause'

interface VideoState {
  action: Action
  videoId: string
  time: number
  rate: number
  from: string
  at: number
  nonce: string
}

interface SyncedYoutubePlayerProps {
  roomId: string
  isOwner: boolean
  isMuted: boolean
}

export default function SyncedYoutubePlayer({
  roomId,
  isOwner,
  isMuted,
}: SyncedYoutubePlayerProps) {
  const db = getDatabase()
  const playerRef = useRef<YT.Player | null>(null)
  const applyingRemoteRef = useRef(false)
  const heartbeatRef = useRef<number | null>(null)
  const [videoState, setVideoState] = useState<VideoState | null>(null)

  // 🔹 listen ke Firebase
  useEffect(() => {
    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
    const unsub = onValue(videoRef, (snap) => {
      const val = snap.val() as VideoState | null
      if (!val) return
      setVideoState(val)

      if (!isOwner) {
        applyRemoteState(val)
      }
    })
    return () => unsub()
  }, [db, roomId, isOwner])

  // 🔹 guest apply remote
  function applyRemoteState(remote: VideoState) {
    const player = playerRef.current
    if (!player) return

    applyingRemoteRef.current = true
    try {
      const current = player.getCurrentTime()
      const diff = Math.abs(current - remote.time)

      // 🔹 hanya seek kalau perbedaan > 60 detik
      if (diff > 60) {
        player.seekTo(remote.time, true)
      }

      // 🔹 action play/pause tetap sinkron
      if (remote.action === 'play') {
        if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
          player.playVideo()
        }
      } else {
        if (player.getPlayerState() !== YT.PlayerState.PAUSED) {
          player.pauseVideo()
        }
      }
    } finally {
      setTimeout(() => {
        applyingRemoteRef.current = false
      }, 500)
    }
  }

  // 🔹 owner tulis ke Firebase
  async function writeVideoState(action: Action) {
    if (!auth.currentUser || !videoState || !playerRef.current) return
    const player = playerRef.current

    const payload: VideoState = {
      action,
      videoId: videoState.videoId,
      time: player.getCurrentTime(),
      rate: player.getPlaybackRate(),
      from: auth.currentUser.uid,
      at: Date.now(),
      nonce: uuidv4(),
    }

    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
    await set(videoRef, payload)
  }

  // 🔹 heartbeat
  function startHeartbeat() {
    if (!isOwner || heartbeatRef.current) return
    heartbeatRef.current = window.setInterval(() => {
      writeVideoState('play').catch(() => {})
    }, 2000)
  }
  function stopHeartbeat() {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }
  useEffect(() => () => stopHeartbeat(), [])

  // 🔹 youtube events
  function handleReady(e: YouTubeEvent) {
    playerRef.current = e.target
    if (videoState && !isOwner) applyRemoteState(videoState)
  }

  function handleStateChange(e: YouTubeEvent) {
    if (applyingRemoteRef.current) return
    if (!isOwner) return

    if (e.data === YT.PlayerState.PLAYING) {
      startHeartbeat()
      writeVideoState('play')
    } else if (e.data === YT.PlayerState.PAUSED) {
      stopHeartbeat()
      writeVideoState('pause')
    }
  }

  useEffect(() => {
    if (!playerRef.current) return
    if (isMuted || !isOwner) {
      playerRef.current.mute()
    } else {
      playerRef.current.unMute()
    }
  }, [isMuted, isOwner])

  const opts: YT.PlayerOptions = {
    width: '100%',
    height: '100%',
    playerVars: {
      mute: isOwner ? 0 : 1,
      autoplay: isOwner ? 0 : 1,
      controls: isOwner ? 1 : 0,
      disablekb: isOwner ? 0 : 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
  }

  return (
    <div className="w-full h-full">
      {videoState ? (
        <div className="relative w-full h-full">
          <YouTube
            videoId={videoState.videoId}
            opts={opts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            iframeClassName="w-full h-full"
            className="w-full h-full"
            loading="lazy"
          />

          {/* Overlay untuk guest agar tidak bisa klik */}
          {!isOwner && (
            <div className="absolute inset-0 z-10 cursor-not-allowed" />
          )}
        </div>
      ) : (
        <div className="text-white">Loading video…</div>
      )}
    </div>
  )
}

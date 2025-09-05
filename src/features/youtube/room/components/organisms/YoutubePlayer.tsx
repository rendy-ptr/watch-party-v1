'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import YouTube, { YouTubeEvent } from 'react-youtube'
import { getDatabase, ref, onValue, set } from 'firebase/database'
import { auth } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'
import { usePlayerStore } from '@/store/playerStore'
import { useYoutubeRoomStore } from '@/store/youtubeRoomStore'

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

export default function SyncedYoutubePlayer() {
  const db = getDatabase()
  const applyingRemoteRef = useRef(false)
  const heartbeatRef = useRef<number | null>(null)
  const [videoState, setVideoState] = useState<VideoState | null>(null)
  const { player, setPlayer } = usePlayerStore()
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const { roomId, isMuted } = useYoutubeRoomStore()
  const isOwner = useYoutubeRoomStore((s) => s.isOwner())

  // 🔹 wrapper aman untuk YouTube API
  function safeCall(action: () => void) {
    try {
      action()
    } catch (e) {
      console.warn('YouTube API call failed:', e)
    }
  }

  // 🔹 guest apply remote
  const applyRemoteState = useCallback(
    (remote: VideoState) => {
      if (!player || !player.getIframe()) return
      if (!player.getVideoData || !player.getVideoData().video_id) return
      if (!isPlayerReady) return

      applyingRemoteRef.current = true
      try {
        const current = player.getCurrentTime()
        const diff = Math.abs(current - remote.time)

        if (diff > 1) {
          safeCall(() => player.seekTo(remote.time, true))
        }

        if (remote.action === 'play') {
          if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
            safeCall(() => player.playVideo())
          }
        } else {
          if (player.getPlayerState() !== YT.PlayerState.PAUSED) {
            safeCall(() => player.pauseVideo())
          }
        }
      } finally {
        setTimeout(() => {
          applyingRemoteRef.current = false
        }, 500)
      }
    },
    [player, isPlayerReady],
  )

  // 🔹 listen ke Firebase
  useEffect(() => {
    let mounted = true
    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
    const unsub = onValue(videoRef, (snap) => {
      if (!mounted) return
      const val = snap.val() as VideoState | null
      if (!val) return
      setVideoState(val)

      if (!isOwner) {
        applyRemoteState(val)
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [db, roomId, isOwner, applyRemoteState])

  // 🔹 owner tulis ke Firebase
  async function writeVideoState(action: Action) {
    if (
      !auth.currentUser ||
      !player ||
      !player.getIframe() ||
      !player.getVideoData()?.video_id
    )
      return

    const videoId = player.getVideoData()?.video_id || videoState?.videoId || ''

    const payload: VideoState = {
      action,
      videoId,
      time: player.getCurrentTime(),
      rate: player.getPlaybackRate(),
      from: auth.currentUser.uid,
      at: Date.now(),
      nonce: uuidv4(),
    }

    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
    await set(videoRef, payload)
  }

  // 🔹 heartbeat (hanya saat PLAY)
  function startHeartbeat() {
    if (!isOwner || heartbeatRef.current) return
    heartbeatRef.current = window.setInterval(() => {
      if (player?.getPlayerState() === YT.PlayerState.PLAYING) {
        writeVideoState('play').catch(() => {})
      }
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
    setPlayer(e.target)
    setIsPlayerReady(true)

    if (videoState && !isOwner) applyRemoteState(videoState)

    e.target.mute()
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

  // 🔹 mute/unmute sync
  useEffect(() => {
    if (!player || !player.getIframe()) return
    if (isMuted) {
      safeCall(() => player.mute())
    } else {
      safeCall(() => player.unMute())
    }
  }, [isMuted, player])

  const opts: YT.PlayerOptions = {
    width: '100%',
    height: '100%',
    playerVars: {
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

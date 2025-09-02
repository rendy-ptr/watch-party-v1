'use client'

import { useEffect, useRef } from 'react'
import YouTube, { YouTubePlayer, YouTubeProps } from 'react-youtube'
import { ref, onValue, getDatabase } from 'firebase/database'
import { updateVideoState } from '../services/updateVideoState'
import { auth } from '@/lib/firebase'
import { User } from '@/types/users'

interface YoutubePlayerProps {
  url: string
  roomId: string
  onlineUsersList: User[]
}

const YoutubePlayer = ({
  url,
  roomId,
  onlineUsersList,
}: YoutubePlayerProps) => {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const db = getDatabase()
  const videoId = new URL(url).searchParams.get('v') ?? ''

  const ownerUid = onlineUsersList.find((u) => u.role === 'owner')?.id
  const isOwner = auth.currentUser?.uid === ownerUid

  // Guest: sync dengan owner
  useEffect(() => {
    if (!ownerUid) return

    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
    const unsubscribe = onValue(videoRef, async (snapshot) => {
      const data = snapshot.val()
      if (!data || !playerRef.current) return

      const player = playerRef.current

      if (auth.currentUser?.uid === ownerUid) return // owner tidak auto-sync

      const currentTime = await player.getCurrentTime()
      const diff = Math.abs(currentTime - data.timestamp)

      if (data.state === 'playing') {
        if (diff > 1) player.seekTo(data.timestamp, true)
        player.playVideo()
      } else if (data.state === 'paused') {
        if (diff > 0.5) player.seekTo(data.timestamp, true)
        player.pauseVideo()
      }
    })

    return () => unsubscribe()
  }, [roomId, ownerUid, db])

  // Ready event
  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target
  }

  // State change (hanya owner yang update firebase)
  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (!auth.currentUser || !playerRef.current) return
    if (!isOwner) {
      // Guest: abaikan event & paksa pause agar tidak desync
      event.target.pauseVideo()
      return
    }

    const currentTime = playerRef.current.getCurrentTime()
    if (event.data === 1) {
      // playing
      updateVideoState(roomId, 'playing', currentTime)
    } else if (event.data === 2) {
      // paused
      updateVideoState(roomId, 'paused', currentTime)
    }
  }

  return (
    <YouTube
      videoId={videoId}
      className="w-full h-full"
      opts={{
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: isOwner ? 1 : 0, // Guest tanpa kontrol
          disablekb: 1, // disable keyboard shortcut
        },
      }}
      onReady={onReady}
      onStateChange={onStateChange}
    />
  )
}

export default YoutubePlayer

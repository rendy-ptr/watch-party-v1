import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'
export interface VideoEvent {
  action: 'play' | 'pause' | 'seek' | 'load'
  videoId: string
  time?: number
  rate?: number
  from?: string
  at?: number
  nonce?: string
}

export function useVideoEvents(roomId: string): VideoEvent | null {
  const [event, setEvent] = useState<VideoEvent | null>(null)

  useEffect(() => {
    const db = getDatabase()
    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)

    const unsubscribe = onValue(videoRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setEvent({
          action: data.action,
          videoId: data.videoId,
          time: typeof data.time === 'number' ? data.time : 0,
          rate: data.rate,
          from: data.from,
          at: data.at,
          nonce: data.nonce,
        })
      }
    })

    return () => unsubscribe()
  }, [roomId])

  return event
}

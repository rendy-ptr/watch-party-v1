import { getDatabase, ref, set } from 'firebase/database'
import { auth } from '@/lib/firebase'
import { v4 as uuidv4 } from 'uuid'
export interface VideoEvent {
  action: 'play' | 'pause' | 'seek' | 'load'
  videoId: string
  time?: number
  rate?: number
  from?: string
  at?: number
  nonce?: string
}

const db = getDatabase()

export async function publishVideoEvent(roomId: string, event: VideoEvent) {
  if (!auth.currentUser) throw new Error('Not logged in')

  const eventRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
  await set(eventRef, {
    ...event,
    time: Number(event.time ?? 0),
    from: auth.currentUser.uid,
    at: Date.now(),
    nonce: uuidv4(),
  })
}

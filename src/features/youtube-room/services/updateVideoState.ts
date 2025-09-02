import { getDatabase, ref, update, serverTimestamp } from 'firebase/database'
import { auth } from '@/lib/firebase'

const db = getDatabase()

export async function updateVideoState(
  roomId: string,
  state: 'playing' | 'paused',
  timestamp: number,
) {
  if (!auth.currentUser) throw new Error('User must be logged in')

  await update(ref(db, `platform/youtube/rooms/${roomId}/video`), {
    state,
    timestamp,
    lastUpdated: serverTimestamp(),
    updatedBy: auth.currentUser.uid,
  })
}

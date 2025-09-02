import { get, ref, update } from 'firebase/database'
import { getDatabase } from 'firebase/database'
import { auth } from '@/lib/firebase'

const db = getDatabase()

export async function changeVideoUrl(roomId: string, url: string) {
  if (!auth.currentUser) throw new Error('User must be logged in')

  // Verify the user is the owner
  const roomRef = ref(db, `platform/youtube/rooms/${roomId}`)
  const snapshot = await get(roomRef)
  const roomData = snapshot.val()

  if (roomData.video.owner !== auth.currentUser.uid) {
    throw new Error('Only the room owner can change the video')
  }

  await update(ref(db, `platform/youtube/rooms/${roomId}/video`), {
    url,
    state: 'paused',
    timestamp: 0,
    playbackRate: 1,
    lastUpdated: Date.now(),
  })
}

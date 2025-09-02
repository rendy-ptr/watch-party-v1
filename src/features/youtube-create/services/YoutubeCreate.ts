import { getDatabase, ref, push, set, serverTimestamp } from 'firebase/database'
import { auth } from '@/lib/firebase'

const db = getDatabase()

export async function createRoom(youtubeUrl: string) {
  if (!auth.currentUser) throw new Error('User must be logged in')

  const roomRef = push(ref(db, 'platform/youtube/rooms'))
  const roomId = roomRef.key!

  await set(roomRef, {
    video: {
      url: youtubeUrl,
      state: 'paused',
      timestamp: 0,
      owner: auth.currentUser.uid,
    },
    users: {
      [auth.currentUser.uid]: {
        id: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        role: 'owner',
        joinedAt: serverTimestamp(),
      },
    },
  })

  return roomId
}

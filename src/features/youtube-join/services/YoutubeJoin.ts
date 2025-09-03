import { ref, set } from 'firebase/database'
import { getDatabase } from 'firebase/database'
import { auth } from '@/lib/firebase'

const db = getDatabase()

export async function joinRoom(roomId: string) {
  if (!auth.currentUser) throw new Error('Not logged in')

  const userRef = ref(
    db,
    `platform/youtube/rooms/${roomId}/users/${auth.currentUser.uid}`,
  )
  await set(userRef, {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || 'Anonymous',
    photoURL: auth.currentUser.photoURL || null,
    role: 'guest',
    joinedAt: Date.now(),
  })

  return roomId
}

import { getDatabase, ref, remove, get } from 'firebase/database'
import { auth } from '@/lib/firebase'

const db = getDatabase()

export async function leaveRoom(roomId: string) {
  if (!auth.currentUser) throw new Error('User must be logged in')

  const userRef = ref(
    db,
    `platform/youtube/rooms/${roomId}/users/${auth.currentUser.uid}`,
  )

  await remove(userRef)

  // Cek jika room kosong, hapus room
  const usersRef = ref(db, `platform/youtube/rooms/${roomId}/users`)
  const usersSnapshot = await get(usersRef)

  if (
    !usersSnapshot.exists() ||
    Object.keys(usersSnapshot.val()).length === 0
  ) {
    const roomRef = ref(db, `platform/youtube/rooms/${roomId}`)
    await remove(roomRef)
  }
}

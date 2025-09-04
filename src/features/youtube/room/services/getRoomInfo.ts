import { getDatabase, ref, get } from 'firebase/database'
const db = getDatabase()

export async function getRoomInfo(roomId: string) {
  const roomRef = ref(db, `platform/youtube/rooms/${roomId}`)
  const snapshot = await get(roomRef)

  if (!snapshot.exists()) {
    throw new Error('Room not found')
  }

  return snapshot.val()
}

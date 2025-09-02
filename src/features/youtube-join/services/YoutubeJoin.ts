import {
  getDatabase,
  ref,
  set,
  serverTimestamp,
  get,
  remove,
} from 'firebase/database'
import { auth } from '@/lib/firebase'

const db = getDatabase()

export async function joinRoom(roomId: string) {
  if (!auth.currentUser) throw new Error('User must be logged in')

  // 1. Tambahkan user ke room (kalau roomId salah, ini akan bikin node baru kosong + users/{uid})
  const userRef = ref(
    db,
    `platform/youtube/rooms/${roomId}/users/${auth.currentUser.uid}`,
  )

  await set(userRef, {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    photoURL: auth.currentUser.photoURL,
    role: 'Guest',
    joinedAt: serverTimestamp(),
  })

  // 2. Cek apakah video node exist (indikator room valid)
  const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
  const snapshot = await get(videoRef)

  if (!snapshot.exists()) {
    // roomId invalid → rollback (hapus user yang tadi ditulis)
    await remove(userRef)
    throw new Error('Room not found')
  }

  return roomId
}

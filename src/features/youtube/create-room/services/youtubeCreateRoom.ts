import { getDatabase, ref, set } from 'firebase/database'
import { auth } from '@/lib/firebase'
import { nanoid } from 'nanoid'
import { getYoutubeId } from '@/lib/getYoutubeId'

const db = getDatabase()

export async function createRoom(youtubeUrl: string, roomName: string) {
  if (!auth.currentUser) throw new Error('Not logged in')

  const roomId = nanoid(8)
  const videoId = getYoutubeId(youtubeUrl)

  if (!videoId) throw new Error('Invalid YouTube URL')

  const userRef = ref(
    db,
    `platform/youtube/rooms/${roomId}/users/${auth.currentUser.uid}`,
  )
  await set(userRef, {
    id: auth.currentUser.uid,
    name: auth.currentUser.displayName || 'Anonymous',
    photoURL: auth.currentUser.photoURL || null,
    role: 'owner',
    joinedAt: Date.now(),
  })

  const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
  await set(videoRef, {
    action: 'pause',
    videoId,
    time: 0,
    rate: 1,
    from: auth.currentUser.uid,
    at: Date.now(),
    nonce: 'init',
  })

  const metaRef = ref(db, `platform/youtube/rooms/${roomId}/meta`)
  await set(metaRef, {
    exists: true,
    owner: auth.currentUser.uid,
    createdAt: Date.now(),
    roomName: roomName || 'Untitled Room',
  })

  return roomId
}

import { create } from 'zustand'
import { ref, onValue, getDatabase } from 'firebase/database'
import type { User } from '@/types/users'
import type { ChatMessage } from '@/types/chatMessage'
import { usePlayerStore } from './playerStore'
import { auth } from '@/lib/firebase'

interface YoutubeRoomState {
  roomId: string
  videoUrl: string | null
  youtubeUrl: string
  messages: ChatMessage[]
  onlineUsers: number
  onlineUsersList: User[]
  isChatOpen: boolean
  isMuted: boolean

  // actions
  setRoomId: (id: string) => void
  setYoutubeUrl: (url: string) => void
  setIsChatOpen: (open: boolean) => void
  toggleMute: () => void
  initRoomListener: (roomId: string) => void

  // mic state
  isMicOff: boolean
  localStream: MediaStream | null
  toggleMic: () => Promise<void>

  // headphones state
  isHeadphonesOff: boolean
  toggleHeadphones: () => void
  

  // derived state
  currentUser: () => User | undefined
  isOwner: () => boolean
}

const db = getDatabase()

export const useYoutubeRoomStore = create<YoutubeRoomState>((set, get) => ({
  roomId: '',
  videoUrl: null,
  youtubeUrl: '',
  messages: [],
  onlineUsers: 0,
  onlineUsersList: [],
  isChatOpen: true,
  isMuted: true,

  setRoomId: (id) => set({ roomId: id }),
  setYoutubeUrl: (url) => set({ youtubeUrl: url }),
  setIsChatOpen: (open) => set({ isChatOpen: open }),

  // mic state
  isMicOff: true,
  localStream: null,

  // headphones state
  isHeadphonesOff: true,

  toggleMic: async () => {
    const { isMicOff, localStream } = get()

    if (isMicOff) {
      // ✅ baru request mic saat user klik tombol
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        set({ localStream: stream, isMicOff: false })
      } catch (err) {
        console.error('Mic permission denied:', err)
      }
    } else {
      // Matikan mic
      localStream?.getTracks().forEach((t) => t.stop())
      set({ localStream: null, isMicOff: true })
    }
  },

  toggleHeadphones: () =>
    set((s) => ({
      isHeadphonesOff: !s.isHeadphonesOff,
    })),

  toggleMute: () =>
    set((state) => {
      const newVal = !state.isMuted
      const { mute, unMute } = usePlayerStore.getState()
      if (newVal) {
        mute()
      } else {
        unMute()
      }
      return { isMuted: newVal }
    }),

  initRoomListener: (roomId) => {
    if (!roomId) return

    // Video URL
    const videoRef = ref(db, `platform/youtube/rooms/${roomId}/video`)
    onValue(videoRef, (snapshot) => {
      const data = snapshot.val()
      if (data?.videoId) set({ videoUrl: data.videoId })
    })

    // Messages
    const messagesRef = ref(db, `platform/youtube/rooms/${roomId}/messages`)
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messagesList: ChatMessage[] = Object.entries(data).map(
          ([key, value]) => ({
            id: key,
            ...(value as Omit<ChatMessage, 'id'>),
          }),
        )
        set({
          messages: messagesList.sort((a, b) => a.timestamp - b.timestamp),
        })
      }
    })

    // Users
    const usersRef = ref(db, `platform/youtube/rooms/${roomId}/users`)
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val() as Record<string, User> | null
      if (data) {
        const usersArray: User[] = Object.entries(data).map(([uid, user]) => ({
          id: uid,
          name: user.name,
          photoURL: user.photoURL || '',
          role: user.role === 'owner' ? 'owner' : 'guest',
          joinedAt: user.joinedAt || 0,
        }))
        set({
          onlineUsers: usersArray.length,
          onlineUsersList: usersArray,
        })
      } else {
        set({ onlineUsers: 0, onlineUsersList: [] })
      }
    })
  },
  currentUser: () => {
    const uid = auth.currentUser?.uid
    return get().onlineUsersList.find((u) => u.id === uid)
  },

  isOwner: () => {
    const user = get().currentUser()
    return user?.role === 'owner'
  },
}))

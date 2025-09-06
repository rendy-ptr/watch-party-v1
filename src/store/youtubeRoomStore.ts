import { create } from 'zustand'
import { ref, onValue, getDatabase } from 'firebase/database'
import type { User } from '@/types/users'
import type { ChatMessage } from '@/types/chatMessage'
import { usePlayerStore } from './playerStore'
import { auth } from '@/lib/firebase'
import { Room, createLocalAudioTrack } from 'livekit-client'
import type {
  RemoteTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  LocalAudioTrack,
  LocalTrackPublication,
} from 'livekit-client'

interface YoutubeRoomState {
  roomId: string
  roomName: string
  videoUrl: string | null
  youtubeUrl: string
  messages: ChatMessage[]
  onlineUsers: number
  onlineUsersList: User[]
  isChatOpen: boolean
  isMuted: boolean

  // LiveKit voice chat
  room: Room | null
  isMicOff: boolean
  localAudioTrack: LocalAudioTrack | null
  localPublication: LocalTrackPublication | null
  isHeadphonesOff: boolean
  audioElements: Record<string, HTMLAudioElement>

  joinVoiceRoom: (url: string, token: string) => Promise<void>
  toggleMic: () => Promise<void>
  toggleHeadphones: () => void
  leaveVoiceRoom: () => Promise<void>

  // actions
  setRoomId: (id: string) => void
  setRoomName: (name: string) => void
  setYoutubeUrl: (url: string) => void
  setIsChatOpen: (open: boolean) => void
  toggleMute: () => void
  initRoomListener: (roomId: string) => void

  // derived state
  currentUser: () => User | undefined
  isOwner: () => boolean
}

const db = getDatabase()

export const useYoutubeRoomStore = create<YoutubeRoomState>((set, get) => ({
  roomId: '',
  roomName: '',
  videoUrl: null,
  youtubeUrl: '',
  messages: [],
  onlineUsers: 0,
  onlineUsersList: [],
  isChatOpen: true,
  isMuted: true,

  // livekit
  room: null,
  isMicOff: true,
  localAudioTrack: null,
  localPublication: null,
  isHeadphonesOff: true, // default: headphones off (muted)
  audioElements: {},

  setRoomId: (id) => set({ roomId: id }),
  setRoomName: (name) => set({ roomName: name }),
  setYoutubeUrl: (url) => set({ youtubeUrl: url }),
  setIsChatOpen: (open) => set({ isChatOpen: open }),

  joinVoiceRoom: async (url: string, token: string) => {
    const room = new Room() // options optional here
    // connect with options (autoSubscribe allowed here)
    await room.connect(url, token, { autoSubscribe: true })

    // when a remote track is subscribed -> create <audio> element and store it
    room.on(
      'trackSubscribed',
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => {
        if (track.kind !== 'audio') return

        const audioEl = document.createElement('audio')
        audioEl.autoplay = true
        audioEl.controls = false
        // attach the underlying MediaStreamTrack for playback
        audioEl.srcObject = new MediaStream([track.mediaStreamTrack])
        audioEl.dataset.participantId = participant.sid
        audioEl.muted = get().isHeadphonesOff

        // choose container (you can add <div id="livekit-audio-container"/> in your layout)
        const container =
          document.getElementById('livekit-audio-container') ?? document.body
        container.appendChild(audioEl)

        set((s) => ({
          audioElements: { ...s.audioElements, [participant.sid]: audioEl },
        }))
      },
    )

    // when track unsubscribed -> cleanup element
    room.on(
      'trackUnsubscribed',
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant,
      ) => {
        if (track.kind !== 'audio') return
        const sid = participant.sid
        const el = get().audioElements[sid]
        if (el) {
          try {
            el.srcObject = null
            el.remove()
          } catch (e) {
            console.warn('Failed track unsubscribed', e)
          }
          set((s) => {
            const copy = { ...s.audioElements }
            delete copy[sid]
            return { audioElements: copy }
          })
        }
      },
    )

    // participant disconnected -> cleanup as well
    room.on('participantDisconnected', (participant: RemoteParticipant) => {
      const sid = participant.sid
      const el = get().audioElements[sid]
      if (el) {
        try {
          el.srcObject = null
          el.remove()
        } catch (e) {
          console.warn('Failed participant disconnected', e)
        }
        set((s) => {
          const copy = { ...s.audioElements }
          delete copy[sid]
          return { audioElements: copy }
        })
      }
    })

    set({ room })
  },

  toggleMic: async () => {
    const { room, isMicOff } = get()
    if (!room) {
      console.warn('Not connected to voice room')
      return
    }

    if (isMicOff) {
      // === ON mic (unmute) ===
      try {
        // Buat track audio baru
        const track = await createLocalAudioTrack()
        const pub = await room.localParticipant.publishTrack(track)
        set({
          localAudioTrack: track,
          localPublication: pub,
          isMicOff: false,
        })
      } catch (err) {
        console.error('createLocalAudioTrack / publish failed', err)
      }
    } else {
      // === OFF mic (mute) ===
      const { localAudioTrack, localPublication } = get()

      // Stop MediaStreamTrack untuk benar-benar mematikan mic
      if (localAudioTrack?.mediaStreamTrack) {
        try {
          localAudioTrack.mediaStreamTrack.stop()
        } catch (err) {
          console.warn('Failed to stop MediaStreamTrack:', err)
        }
      }

      // Unpublish track dari room
      if (localPublication) {
        try {
          // Cek apakah publication masih valid
          const currentPubs = Array.from(
            room.localParticipant.trackPublications.values(),
          )
          const isStillPublished = currentPubs.some(
            (pub) => pub.trackSid === localPublication.trackSid,
          )

          if (isStillPublished && localPublication.track) {
            await room.localParticipant.unpublishTrack(
              localPublication.track,
              true,
            )
          }
        } catch (err) {
          console.warn('unpublishTrack failed:', err)
        }
      }

      // Cleanup localAudioTrack
      if (localAudioTrack) {
        try {
          localAudioTrack.stop()
        } catch (err) {
          console.warn('Failed to stop localAudioTrack:', err)
        }
      }

      // Reset state
      set({
        localAudioTrack: null,
        localPublication: null,
        isMicOff: true,
      })
    }
  },

  toggleHeadphones: () =>
    set((s) => {
      const newVal = !s.isHeadphonesOff
      Object.values(s.audioElements).forEach((el) => {
        try {
          el.muted = newVal
        } catch (e) {
          console.warn('Failed toggle headphones', e)
        }
      })
      return { isHeadphonesOff: newVal }
    }),

  leaveVoiceRoom: async () => {
    const { room, audioElements, localAudioTrack } = get()
    if (!room) return

    try {
      // 1. mute track dulu biar tidak ada audio tersisa
      if (localAudioTrack) {
        try {
          localAudioTrack.mute()
        } catch (e) {
          console.warn('Failed to mute track before leave', e)
        }
      }

      // 2. disconnect dari room
      await room.disconnect()
    } catch (e) {
      console.warn('Failed to disconnect room', e)
    }

    // 3. cleanup semua elemen <audio>
    Object.values(audioElements).forEach((el) => {
      try {
        el.srcObject = null
        el.remove()
      } catch (e) {
        console.warn('Failed to cleanup audio element', e)
      }
    })

    // 4. reset state
    set({
      room: null,
      localAudioTrack: null,
      localPublication: null,
      audioElements: {},
      isMicOff: true,
    })
  },

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

    // Get Room Name
    const metaRef = ref(db, `platform/youtube/rooms/${roomId}/meta`)
    onValue(metaRef, (snapshot) => {
      const data = snapshot.val()
      if (data?.roomName) {
        set({ roomName: data.roomName })
      }
    })

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

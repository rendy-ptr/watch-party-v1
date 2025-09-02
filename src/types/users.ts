// types/users.ts
export interface User {
  id: string
  name: string | null
  photoURL: string | null
  role: 'owner' | 'guest' // Konsisten dengan lowercase
  joinedAt: number
}

export interface VideoState {
  url: string
  state: 'playing' | 'paused'
  timestamp: number
  playbackRate: number
  owner: string
  lastUpdated: number
}

export interface Room {
  video: VideoState
  users: Record<string, User>
  messages?: Record<string, ChatMessage>
}
export interface ChatMessage {
  id: string
  userId: string
  userName: string | null
  userPhotoURL: string | null
  message: string
  timestamp: number
}

export interface BackgroundStyles {
  container: string
  gridPattern: React.CSSProperties
  ambientOrbs: string[]
  bottomGlow: string
}

export interface Meteor {
  id: number
  left: number
  animationDelay: number
  animationDuration: number
}

export interface Particle {
  id: number
  left: number
  top: number
  size: number
  animationDelay: number
  animationDuration: number
}

export interface ChatMessage {
  id: string
  uid: string
  name: string
  text: string
  ts: number
  photoURL?: string | null
}

export interface PlayerState {
  playing: boolean
  seconds: number
  updatedBy: string | null
  updatedAt?: number | object
}

export interface RoomData {
  createdAt: number
  ownerId: string
  videoId: string | null
  state: PlayerState
}

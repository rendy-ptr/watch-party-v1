import { create } from 'zustand'

interface PlayerState {
  player: YT.Player | null
  setPlayer: (player: YT.Player) => void
  mute: () => void
  unMute: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  mute: () => get().player?.mute(),
  unMute: () => get().player?.unMute(),
}))

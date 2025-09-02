import type { BackgroundStyles } from '@/types/type'

export const BACKGROUND_STYLES: BackgroundStyles = {
  container:
    'min-h-screen bg-gradient-to-br from-sky-300 via-blue-400 to-cyan-500 overflow-hidden relative',
  gridPattern: {
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  },
  ambientOrbs: [
    'absolute top-20 left-10 w-32 h-32 bg-white rounded-full opacity-20 blur-xl animate-pulse',
    'absolute top-40 right-20 w-24 h-24 bg-cyan-200 rounded-full opacity-25 blur-xl animate-pulse',
    'absolute bottom-32 left-1/4 w-28 h-28 bg-blue-200 rounded-full opacity-30 blur-xl animate-pulse',
  ],
  bottomGlow:
    'absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-to-t from-blue-600/20 to-transparent blur-xl',
}

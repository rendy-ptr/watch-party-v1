'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ref, set, get, child, serverTimestamp } from 'firebase/database'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { nanoid } from 'nanoid'
import { parseYouTubeUrlToId } from '@/lib/youtube'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function ContentPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [roomIdInput, setRoomIdInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[Content] Auth state changed:', firebaseUser)
      if (!firebaseUser) {
        setUser(null)
        router.replace('/')
      } else {
        setUser(firebaseUser)
      }
    })
    return () => unsub()
  }, [router])

  if (user === undefined) {
    return (
      <AnimatedBackground>
        <div className="flex items-center justify-center min-h-screen text-white">
          Checking authentication...
        </div>
      </AnimatedBackground>
    )
  }

  if (!user) return null

  const createRoom = async () => {
    console.log('[Content] Creating room...')
    if (isCreating) return
    setIsCreating(true)
    setError('')
    try {
      const id = nanoid(10)
      const videoId = parseYouTubeUrlToId(youtubeUrl)
      if (youtubeUrl && !videoId) throw new Error('Invalid YouTube URL')
      await set(ref(db, `rooms/${id}`), {
        ownerId: user.uid,
        ownerName: user.displayName || 'Guest',
        ownerPhoto: user.photoURL || null,
        videoId: videoId || null,
        createdAt: serverTimestamp(),
        state: {
          playing: false,
          seconds: 0,
          updatedBy: null,
          updatedAt: serverTimestamp(),
        },
        users: {
          [user.uid]: {
            uid: user.uid,
            name: user.displayName || 'Guest',
            photoURL: user.photoURL || null,
            joinedAt: serverTimestamp(),
          },
        },
      })
      console.log('[Content] Room created:', id)
      router.push(`/room/${id}`)
    } catch (err) {
      if (err instanceof Error) {
        console.error('[Content] Error creating room:', err)
        setError(err.message)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const joinRoom = async () => {
    console.log('[Content] Joining room...')
    if (isJoining || !roomIdInput.trim()) return
    const slug = roomIdInput.trim().replace(/^.*\/(room\/)?/, '')
    if (!slug) return
    setIsJoining(true)
    setError('')
    try {
      const snapshot = await get(child(ref(db), `rooms/${slug}`))
      if (!snapshot.exists()) {
        setError('Room not found')
        console.log('[Content] Room not found:', slug)
        return
      }
      await set(ref(db, `rooms/${slug}/users/${user.uid}`), {
        uid: user.uid,
        name: user.displayName || 'Guest',
        photoURL: user.photoURL || null,
        joinedAt: serverTimestamp(),
      })
      console.log('[Content] Joined room:', slug)
      router.push(`/room/${slug}`)
    } catch (err) {
      if (err instanceof Error) {
        console.error('[Content] Error joining room:', err)
        setError(err.message)
      }
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: 'create' | 'join',
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (action === 'create') {
        createRoom()
      } else {
        joinRoom()
      }
    }
  }
  return (
    <AnimatedBackground>
      <div className="w-full max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 font-mono mb-4 tracking-wider text-center">
          WATCH PARTY
        </h1>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-4">
            Create New Room
          </h2>
          <input
            className="w-full px-4 py-4 mb-4 bg-black/20 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 backdrop-blur-sm"
            placeholder="YouTube URL or video ID (optional)"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'create')}
            disabled={isCreating}
          />
          <button
            onClick={createRoom}
            disabled={isCreating}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg"
          >
            {isCreating ? 'Creating Room...' : 'Create Room'}
          </button>
        </div>

        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join Existing Room
          </h2>
          <input
            className="w-full px-4 py-4 mb-4 bg-black/20 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 backdrop-blur-sm"
            placeholder="Room ID or URL"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'join')}
            disabled={isJoining}
          />
          <button
            onClick={joinRoom}
            disabled={isJoining || !roomIdInput.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </AnimatedBackground>
  )
}

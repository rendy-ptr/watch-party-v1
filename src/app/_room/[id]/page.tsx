'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ref,
  onValue,
  update,
  set,
  serverTimestamp,
  onDisconnect,
  get,
  remove,
} from 'firebase/database'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import YouTubeSyncPlayer from '@/components/YouTubeSyncPlayer'
import Chat from '@/components/Chat'
import { parseYouTubeUrlToId } from '@/lib/youtube'
import Link from 'next/link'
import type { RoomData, PlayerState } from '@/types/type'
import AnimatedBackground from '@/components/AnimatedBackground'
import { toast } from 'sonner'

export default function RoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()


  const [user, setUser] = useState<User | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [state, setState] = useState<PlayerState>({
    playing: false,
    seconds: 0,
    updatedBy: null,
  })
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string>('')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [isSettingVideo, setIsSettingVideo] = useState<boolean>(false)
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/')
        return
      }

      setUser(firebaseUser)
      setMyId(firebaseUser.uid)

      if (!id) return

      const roomRef = ref(db, `rooms/${id}`)
      const userRef = ref(db, `rooms/${id}/users/${firebaseUser.uid}`)

      await set(userRef, {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous',
        photoURL: firebaseUser.photoURL || null,
        joinedAt: serverTimestamp(),
      })

      onDisconnect(userRef).remove()

      const roomSnap = await get(roomRef)
      const data = roomSnap.val() as RoomData | null
      if (!data) return

      setOwnerId(data.ownerId || null)
      setVideoId(data.videoId || null)
      setState(data.state || { playing: false, seconds: 0, updatedBy: null })

      if (firebaseUser.uid === data.ownerId) {
        onDisconnect(roomRef).remove()
      }

      onValue(roomRef, (snapshot) => {
        const updatedData = snapshot.val() as RoomData | null
        if (!updatedData) return
        setState(
          updatedData.state || { playing: false, seconds: 0, updatedBy: null },
        )
        setOwnerId(updatedData.ownerId || null)
        setVideoId(updatedData.videoId || null)
      })

      onValue(ref(db, `rooms/${id}/users`), (snapshot) => {
        const usersData = snapshot.val()
        if (!usersData || Object.keys(usersData).length === 0) {
          remove(roomRef).catch(console.error)
        }
      })

      setChecking(false)
    })

    return () => unsub()
  }, [id, router])

  const setVideo = async () => {
    if (!videoUrl.trim() || myId !== ownerId) return
    const parsedVideoId = parseYouTubeUrlToId(videoUrl)
    if (!parsedVideoId) {
      setError('Invalid YouTube URL/ID')
      return
    }
    setIsSettingVideo(true)
    try {
      await update(ref(db, `rooms/${id}`), { videoId: parsedVideoId })
      setVideoUrl('')
      setError('')
    } catch (err) {
      console.error(err)
      setError('Failed to set video')
    } finally {
      setIsSettingVideo(false)
    }
  }

  const handleRemoteControl = async (next: {
    playing: boolean
    seconds?: number
  }) => {
    if (!id || myId !== ownerId) return
    try {
      const updateData: Partial<PlayerState> = {
        playing: next.playing,
        updatedBy: myId,
        updatedAt: serverTimestamp(),
      }
      if (typeof next.seconds === 'number') updateData.seconds = next.seconds
      await update(ref(db, `rooms/${id}/state`), updateData)
    } catch (err) {
      console.error(err)
    }
  }

  const dismissError = () => setError('')

  if (checking)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/80 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    )

  if (!user) return null

  const isOwner = myId === ownerId

  return (
    <AnimatedBackground>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="m-3 sm:m-4 lg:m-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-red-400 font-medium text-sm">
                    {error}
                  </span>
                </div>
                <button
                  onClick={dismissError}
                  className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-xl">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  {isOwner && (
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-mono tracking-wider">
                    WATCH PARTY
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs sm:text-sm font-medium">
                        Room:
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 sm:px-2.5 sm:py-1 bg-white/10 rounded-md text-purple-300 font-mono text-xs sm:text-sm border border-white/20">
                          {id}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(id)
                            toast.success('Room ID copied to clipboard')
                          }}
                          className="px-2 py-1 text-xs sm:text-sm rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    {isOwner && (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 rounded-md border border-yellow-500/30">
                        <svg
                          className="w-3 h-3 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-yellow-400 text-xs font-bold">
                          HOST
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileChat(!showMobileChat)}
                className="xl:hidden flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-white font-medium text-sm">
                  {showMobileChat ? 'Hide Chat' : 'Show Chat'}
                </span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-3 sm:px-4 lg:px-6">
            {showMobileChat && (
              <div
                className="xl:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowMobileChat(false)}
              >
                <div
                  className="absolute right-0 top-0 h-full w-full max-w-sm bg-white/10 backdrop-blur-xl border-l border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-full">
                    <Chat
                      roomId={id!}
                      onClose={() => setShowMobileChat(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              {/* Video Player Section */}
              <div className="xl:col-span-2">
                <div className="backdrop-blur-xl bg-white/5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                  <div className="w-full h-full bg-black/50 overflow-hidden p-5">
                    <YouTubeSyncPlayer
                      roomId={id!}
                      videoId={videoId || undefined}
                      state={state}
                      myId={myId!}
                      ownerId={ownerId}
                      onRemoteControl={handleRemoteControl}
                    />
                  </div>

                  {/* Video Controls */}
                  {isOwner && (
                    <div className="border-t border-white/10 p-3 sm:p-4 lg:p-6 bg-white/5">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <input
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                            placeholder="Paste YouTube URL or video ID..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            disabled={isSettingVideo}
                            onKeyDown={(e) => e.key === 'Enter' && setVideo()}
                          />
                          <button
                            className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm whitespace-nowrap"
                            disabled={!videoUrl.trim() || isSettingVideo}
                            onClick={setVideo}
                          >
                            {isSettingVideo ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Setting...</span>
                              </div>
                            ) : (
                              'Set Video'
                            )}
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-blue-300 font-semibold text-sm mb-1">
                                Supported YouTube URLs:
                              </h4>
                              <p className="text-blue-200/80 text-xs break-all">
                                • https://youtube.com/watch?v=VIDEO_ID
                              </p>
                              <p className="text-blue-300/60 text-xs mt-2">
                                Only the host can change videos
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info for non-owners */}
                  {!isOwner && (
                    <div className="border-t border-white/10 p-3 sm:p-4 lg:p-6 bg-white/5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span className="text-sm">
                          Only the host can control video playback
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Chat Section */}
              <div className="xl:col-span-1 hidden xl:block">
                <div className="backdrop-blur-xl bg-white/5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/10 shadow-2xl h-[60vh] lg:h-[70vh] xl:h-[600px] 2xl:h-[700px]">
                  <Chat roomId={id!} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="px-3 sm:px-4 lg:px-6 py-8 sm:py-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg sm:rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 shadow-lg"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  )
}

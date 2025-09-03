'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ref, onValue, getDatabase } from 'firebase/database'

import type { User } from '@/types/users'
import HeaderYoutubeRoom from '../sections/HeaderYoutubeRoom'
import VideoYoutubeRoom from '../sections/VideoYoutubeRoom'
import ChatYoutubeRoom, { ChatMessage } from '../sections/ChatYoutubeRoom'

const db = getDatabase()

const YoutubeRoomContainer = () => {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? ''
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const [onlineUsersList, setOnlineUsersList] = useState<User[]>([])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!id) return

    // Video URL
    const videoRef = ref(db, `platform/youtube/rooms/${id}/video`)
    const unsubscribeVideo = onValue(videoRef, (snapshot) => {
      const data = snapshot.val()
      if (data?.videoId) setVideoUrl(data.videoId)
    })

    // Chat messages
    const messagesRef = ref(db, `platform/youtube/rooms/${id}/messages`)
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messagesList: ChatMessage[] = Object.entries(data).map(
          ([key, value]) => ({
            id: key,
            ...(value as Omit<ChatMessage, 'id'>),
          }),
        )
        setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp))
      }
    })

    // Users in room (online count + list)
    const usersRef = ref(db, `platform/youtube/rooms/${id}/users`)
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() as Record<string, User> | null

      if (data) {
        const usersArray: User[] = Object.entries(data).map(([uid, user]) => ({
          id: uid,
          name: user.name,
          photoURL: user.photoURL || '',
          role: user.role === 'owner' ? 'owner' : 'guest',
          joinedAt: user.joinedAt || 0,
        }))

        setOnlineUsers(usersArray.length)
        setOnlineUsersList(usersArray)
      } else {
        setOnlineUsers(0)
        setOnlineUsersList([])
      }
    })

    return () => {
      unsubscribeVideo()
      unsubscribeMessages()
      unsubscribeUsers()
    }
  }, [id])

  if (!videoUrl) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium">
            Loading premium room...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pt-20 lg:pt-30 px-4 lg:px-8">
      {/* Header */}
      <HeaderYoutubeRoom
        id={id}
        onlineUsers={onlineUsers}
        onlineUsersList={onlineUsersList}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        {/* Video Player Section */}
        <VideoYoutubeRoom
          id={id}
          videoUrl={videoUrl}
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={setYoutubeUrl}
          onlineUsersList={onlineUsersList}
        />

        {/* Chat Section */}
        <ChatYoutubeRoom
          id={id}
          messages={messages}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          messagesEndRef={messagesEndRef}
          chatInputRef={chatInputRef}
        />
      </div>
    </div>
  )
}

export default YoutubeRoomContainer

'use client'

import { useParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

import HeaderYoutubeRoom from '../components/sections/HeaderYoutubeRoom'
import VideoYoutubeRoom from '../components/sections/VideoYoutubeRoom'
import ChatYoutubeRoom from '../components/sections/ChatYoutubeRoom'

import { useYoutubeRoomStore } from '../../../../store/youtubeRoomStore'

const YoutubeRoomContainer = () => {
  const params = useParams()
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id ?? ''

  const { videoUrl, messages, initRoomListener } = useYoutubeRoomStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (roomId) {
      useYoutubeRoomStore.getState().setRoomId(roomId)
      initRoomListener(roomId)
    }
  }, [roomId, initRoomListener])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      <HeaderYoutubeRoom />

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        <VideoYoutubeRoom />
        <ChatYoutubeRoom
          messagesEndRef={messagesEndRef}
          chatInputRef={chatInputRef}
        />
      </div>
    </div>
  )
}

export default YoutubeRoomContainer

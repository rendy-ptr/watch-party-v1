'use client'
import { MessageCircle, Send, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { ref, getDatabase, push } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import Image from 'next/image'
import { formatToWIB } from '@/lib/date'
import { useYoutubeRoomStore } from '@/store/youtubeRoomStore'

const db = getDatabase()
const auth = getAuth()

interface ChatMessagesProps {
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  chatInputRef: React.RefObject<HTMLInputElement | null>
}

const ChatYoutubeRoom = ({
  messagesEndRef,
  chatInputRef,
}: ChatMessagesProps) => {
  const [newMessage, setNewMessage] = useState('')
  const [user] = useAuthState(auth)
  const { roomId, messages, isChatOpen, setIsChatOpen } = useYoutubeRoomStore()

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !user) return

    const messageData = {
      userId: user.uid,
      name: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      message: newMessage.trim(),
      timestamp: Date.now(),
    }

    try {
      const messagesRef = ref(db, `platform/youtube/rooms/${roomId}/messages`)
      await push(messagesRef, messageData)
      setNewMessage('')
      chatInputRef.current?.focus()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="xl:col-span-1">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 h-[600px] flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <h3 className="text-white font-semibold">Live Chat</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
            >
              <span className="text-white text-sm">
                {isChatOpen ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {(isChatOpen ||
          (typeof window !== 'undefined' && window.innerWidth >= 1280)) && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group hover:bg-white/5 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      {msg.photoURL ? (
                        <Image
                          src={msg.photoURL}
                          width={32}
                          height={32}
                          alt={msg.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <UserCircle className="h-6 w-6 text-white/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {msg.name}
                        </span>
                        <span className="text-white/40 text-xs">
                          {formatToWIB(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {user && (
              <div className="p-4 border-t border-white/20 bg-white/5 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    maxLength={500}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-white/40 text-xs">
                    {newMessage.length}/500
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
export default ChatYoutubeRoom

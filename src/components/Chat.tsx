// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import Image from 'next/image'
// import { auth, db } from '@/lib/firebase'
// import {
//   limitToLast,
//   onValue,
//   push,
//   query,
//   ref,
//   remove,
//   serverTimestamp,
//   set,
//   onDisconnect,
// } from 'firebase/database'
// import { ChatMessage } from '@/types/type'
// import { useRouter } from 'next/navigation'
// import { onAuthStateChanged } from 'firebase/auth'

// interface ChatProps {
//   roomId: string
//   onClose?: () => void
// }

// export default function Chat({ roomId, onClose }: ChatProps) {
//   const [messages, setMessages] = useState<ChatMessage[]>([])
//   const [text, setText] = useState('')
//   const [isSending, setIsSending] = useState(false)
//   const [error, setError] = useState('')
//   const [userCount, setUserCount] = useState(0)
//   const [authReady, setAuthReady] = useState(false)
//   const listRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)
//   const router = useRouter()

//   // Check auth
//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (user) => {
//       if (!user) router.push('/')
//       else setAuthReady(true)
//     })
//     return () => unsub()
//   }, [router])

//   // Register user in room & handle disconnect
//   useEffect(() => {
//     if (!authReady || !auth.currentUser) return

//     const userId = auth.currentUser.uid
//     const userRef = ref(db, `rooms/${roomId}/users/${userId}`)
//     set(userRef, {
//       uid: userId,
//       name: auth.currentUser.displayName || 'Anonymous',
//       photoURL: auth.currentUser.photoURL || null,
//       joinedAt: serverTimestamp(),
//     })
//     onDisconnect(userRef).remove()

//     // Listen user count
//     const usersRef = ref(db, `rooms/${roomId}/users`)
//     const unsubUsers = onValue(usersRef, (snapshot) => {
//       const users = snapshot.val() || {}
//       setUserCount(Object.keys(users).length)
//     })

//     return () => {
//       unsubUsers()
//       remove(userRef)
//     }
//   }, [roomId, authReady])

//   // Listen chat messages
//   useEffect(() => {
//     if (!authReady) return

//     const chatQuery = query(ref(db, `rooms/${roomId}/chat`), limitToLast(100))
//     const unsubChat = onValue(chatQuery, (snapshot) => {
//       const data = snapshot.val() as Record<
//         string,
//         Omit<ChatMessage, 'id'>
//       > | null
//       if (!data) {
//         setMessages([])
//         return
//       }
//       const arr = Object.entries(data).map(([id, m]) => ({
//         id,
//         uid: m.uid,
//         name: m.name,
//         text: m.text,
//         photoURL: m.photoURL ?? null,
//         ts: typeof m.ts === 'number' ? m.ts : Date.now(),
//       }))
//       arr.sort((a, b) => a.ts - b.ts)
//       setMessages(arr)

//       setTimeout(() => {
//         if (listRef.current) {
//           listRef.current.scrollTop = listRef.current.scrollHeight
//         }
//       }, 100)
//     })

//     return unsubChat
//   }, [roomId, authReady])

//   // Auto scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (listRef.current) {
//       const { scrollTop, scrollHeight, clientHeight } = listRef.current
//       const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

//       if (isNearBottom) {
//         listRef.current.scrollTop = scrollHeight
//       }
//     }
//   }, [messages])

//   // Send message
//   const sendMessage = async () => {
//     if (!auth.currentUser || !text.trim() || isSending) return

//     const messageText = text.trim()
//     setText('') // Clear immediately for better UX
//     setIsSending(true)
//     setError('')

//     try {
//       const msgRef = push(ref(db, `rooms/${roomId}/chat`))
//       await set(msgRef, {
//         uid: auth.currentUser.uid,
//         name: auth.currentUser.displayName || 'Anonymous',
//         photoURL: auth.currentUser.photoURL || null,
//         text: messageText,
//         ts: serverTimestamp(),
//       })
//     } catch (err) {
//       console.error(err)
//       setText(messageText) // Restore text on error
//       setError('Failed to send message')
//       setTimeout(() => setError(''), 3000) // Auto dismiss error
//     } finally {
//       setIsSending(false)
//       inputRef.current?.focus()
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setText(e.target.value)
//   }

//   const formatTime = (ts: number) => {
//     const now = Date.now()
//     const diff = now - ts

//     if (diff < 60000) return 'now' // Less than 1 minute
//     if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago` // Less than 1 hour
//     if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago` // Less than 1 day

//     return new Date(ts).toLocaleTimeString('en-US', {
//       hour12: false,
//       hour: '2-digit',
//       minute: '2-digit',
//     })
//   }

//   const getMessageStyle = (msg: ChatMessage, index: number) => {
//     const isCurrent = msg.uid === auth.currentUser?.uid
//     const prevMsg = index > 0 ? messages[index - 1] : null
//     const isConsecutive =
//       prevMsg && prevMsg.uid === msg.uid && msg.ts - prevMsg.ts < 300000 // 5 minutes

//     return { isCurrent, isConsecutive }
//   }

//   const dismissError = () => setError('')

//   if (!authReady)
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="flex flex-col items-center gap-2 sm:gap-3">
//           <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
//           <span className="text-white/60 text-xs sm:text-sm">
//             Checking login...
//           </span>
//         </div>
//       </div>
//     )

//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat Header */}
//       <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-white/10 flex-shrink-0">
//         <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//           <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
//             <svg
//               className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//               />
//             </svg>
//           </div>
//           <div className="min-w-0 flex-1">
//             <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
//               Live Chat
//             </h3>
//             <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-slate-400">
//               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
//               <span className="truncate">
//                 {userCount} {userCount === 1 ? 'user' : 'users'} online
//               </span>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={onClose}
//           className="sm:hidden p-1 ml-2 rounded-lg hover:bg-white/10 transition-colors"
//         >
//           <svg
//             className="w-5 h-5 text-white"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>

//         <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 bg-green-500/20 rounded-md sm:rounded-lg backdrop-blur-sm border border-green-500/30 flex-shrink-0">
//           <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
//           <span className="text-xs text-green-400 font-bold">{userCount}</span>
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="mx-3 sm:mx-4 lg:mx-6 mt-2 sm:mt-3 p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex-shrink-0">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2 min-w-0">
//               <svg
//                 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span className="text-red-400 text-xs sm:text-sm font-medium min-w-0 break-words">
//                 {error}
//               </span>
//             </div>
//             <button
//               onClick={dismissError}
//               className="p-1 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0 ml-2"
//             >
//               <svg
//                 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Messages */}
//       <div
//         ref={listRef}
//         className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 space-y-2 sm:space-y-3 min-h-0 scroll-smooth"
//       >
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
//             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 sm:mb-4">
//               <svg
//                 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                 />
//               </svg>
//             </div>
//             <p className="text-slate-400 font-medium text-sm sm:text-base">
//               No messages yet
//             </p>
//             <p className="text-slate-500 text-xs sm:text-sm mt-1">
//               Start the conversation!
//             </p>
//           </div>
//         ) : (
//           messages.map((msg, index) => {
//             const { isCurrent, isConsecutive } = getMessageStyle(msg, index)
//             return (
//               <div
//                 key={msg.id}
//                 className={`flex gap-2 sm:gap-3 ${
//                   isCurrent ? 'justify-end' : 'justify-start'
//                 }`}
//               >
//                 {/* Avatar for others */}
//                 {!isCurrent && (
//                   <div
//                     className={`${
//                       isConsecutive ? 'w-6 sm:w-8' : ''
//                     } flex-shrink-0`}
//                   >
//                     {!isConsecutive && (
//                       <Image
//                         src={msg.photoURL || '/default-avatar.png'}
//                         alt={msg.name}
//                         width={32}
//                         height={32}
//                         className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shadow-lg"
//                       />
//                     )}
//                   </div>
//                 )}

//                 {/* Message bubble */}
//                 <div
//                   className={`max-w-[75%] sm:max-w-xs lg:max-w-sm ${
//                     isCurrent ? 'order-1' : ''
//                   }`}
//                 >
//                   {!isConsecutive && (
//                     <div
//                       className={`flex items-center gap-1.5 sm:gap-2 mb-1 ${
//                         isCurrent ? 'justify-end' : 'justify-start'
//                       }`}
//                     >
//                       <span className="text-xs font-bold text-slate-300 truncate">
//                         {msg.name}
//                       </span>
//                       <span className="text-xs text-slate-500 flex-shrink-0">
//                         {formatTime(msg.ts)}
//                       </span>
//                     </div>
//                   )}

//                   <div
//                     className={`px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl ${
//                       isCurrent
//                         ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
//                         : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
//                     } ${
//                       isConsecutive
//                         ? isCurrent
//                           ? 'rounded-tr-md'
//                           : 'rounded-tl-md'
//                         : ''
//                     }`}
//                   >
//                     <div className="text-xs sm:text-sm leading-relaxed break-words">
//                       {msg.text}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Avatar for current user */}
//                 {isCurrent && (
//                   <div
//                     className={`${
//                       isConsecutive ? 'w-6 sm:w-8' : ''
//                     } flex-shrink-0`}
//                   >
//                     {!isConsecutive && (
//                       <Image
//                         src={msg.photoURL || '/default-avatar.png'}
//                         alt={msg.name}
//                         width={32}
//                         height={32}
//                         className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shadow-lg"
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>
//             )
//           })
//         )}
//       </div>

//       {/* Input */}
//       <div className="p-3 sm:p-4 lg:p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
//         <div className="flex gap-2 sm:gap-3">
//           <div className="flex-1 relative min-w-0">
//             <input
//               ref={inputRef}
//               className="w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:py-4 bg-black/30 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12 sm:pr-16 text-sm"
//               placeholder="Type a message..."
//               value={text}
//               onChange={handleInputChange}
//               onKeyDown={handleKeyPress}
//               disabled={isSending}
//               maxLength={500}
//             />
//             <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
//               {text.length}/500
//             </div>
//           </div>

//           <button
//             className="px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex-shrink-0"
//             onClick={sendMessage}
//             disabled={!text.trim() || isSending}
//           >
//             {isSending ? (
//               <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//             ) : (
//               <svg
//                 className="w-4 h-4 sm:w-5 sm:h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                 />
//               </svg>
//             )}
//           </button>
//         </div>

//         <div className="flex items-center justify-between mt-2 sm:mt-3 text-xs text-slate-500">
//           <span>Press Enter to send</span>
//           <div className="flex items-center gap-2 sm:gap-4">
//             <span className="hidden sm:inline">{messages.length} messages</span>
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
//               <span>Connected</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

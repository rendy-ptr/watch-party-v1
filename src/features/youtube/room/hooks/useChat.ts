// import { ChatMessage } from '@/types/type'
// import { onValue, ref } from 'firebase/database'
// import { useRef, useState, useEffect } from 'react'

// export const useChat = () => {
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const [messages, setMessages] = useState<ChatMessage[]>([])

//   const useScrollMessagesToBottom = (messages: ChatMessage) => {
//     useEffect(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//     }, [messages])
//   }

//   const addMessages = (roomId: string) => {
//     const messagesRef = ref(db, `platform/youtube/rooms/${roomId}/messages`)
//     const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val()
//       if (data) {
//         const messagesList: ChatMessage[] = Object.entries(data).map(
//           ([key, value]) => ({
//             id: key,
//             ...(value as Omit<ChatMessage, 'id'>),
//           }),
//         )
//         setMessages(messagesList.sort((a, b) => a.timestamp - b.timestamp))
//       }
//     })
//   }

//   return { useScrollMessagesToBottom, addMessages }
// }

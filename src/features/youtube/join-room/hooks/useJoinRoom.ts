import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { joinRoom } from '../services/youtubeJoinRoom'

export const useJoinRoom = () => {
  const [idRoom, setIdRoom] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleJoinRoom = async (idRoom: string) => {
    setIsLoading(true)
    try {
      const roomId = await joinRoom(idRoom)
      router.push(`/platform/youtube/room/${roomId}`)
      toast.success('Joining Room successfully!')
    } catch (err) {
      console.error('Failed to join room:', err)
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return { handleJoinRoom, isLoading, idRoom, setIdRoom }
}

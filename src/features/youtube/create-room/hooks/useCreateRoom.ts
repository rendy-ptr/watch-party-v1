import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createRoom } from '../services/youtubeCreateRoom'

export const useCreateRoom = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const router = useRouter()

  const createRoomHandler = async (youtubeUrl: string) => {
    setIsLoading(true)
    try {
      const roomId = await createRoom(youtubeUrl)
      console.log('Room created:', roomId)
      router.push(`/platform/youtube/room/${roomId}`)
      toast.success('Room created successfully!')
    } catch (err) {
      console.error('Failed to create room:', err)
      toast.error(
        `Failed to create room: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, createRoomHandler, youtubeUrl, setYoutubeUrl }
}

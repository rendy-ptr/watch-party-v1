'use client'
import { useState } from 'react'
import { createRoom } from '../services/YoutubeCreate'
import styles from '../style/youtube-create-section.module.css'
import CustomInput from '../../../components/CustomInput'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const YouTubeCreateSection = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    setIsCreating(true)
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
      setIsCreating(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-20">
      <div className={`${styles.fadeInUp} mb-8`}>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight text-center">
          <span className={styles.gradientText}>CirenFlix</span>
        </h1>
      </div>

      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Create New Room
        </h2>

        <CustomInput
          label="YouTube URL"
          placeholder="Paste a YouTube URL or video ID"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          disabled={isCreating}
        />

        {/* Button dengan loading state */}
        <button
          onClick={handleCreateRoom}
          disabled={isCreating}
          className="w-full mt-6 py-4
             bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500
             text-white font-bold rounded-xl
             transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg
             hover:shadow-cyan-400/30"
        >
          {isCreating ? 'Creating Room...' : 'Create Room'}
        </button>
      </div>
    </div>
  )
}

export default YouTubeCreateSection

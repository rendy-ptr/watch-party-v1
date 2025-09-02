'use client'
import { useState } from 'react'
import styles from '../style/youtube-join.module.css'
import CustomInput from '../../../components/CustomInput'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { joinRoom } from '../services/YoutubeJoin'

const YoutubeJoinContainer = () => {
  const [idRoom, setIdRoom] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    setIsJoining(true)
    try {
      const roomId = await joinRoom(idRoom)
      router.push(`/platform/youtube/room/${roomId}`)
      toast.success('Joining Room successfully!')
    } catch (err) {
      console.error('Failed to join room:', err)
      toast.error(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsJoining(false)
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
          Join Room
        </h2>

        <CustomInput
          label="ID ROOM"
          placeholder="Paste Room ID"
          value={idRoom}
          onChange={(e) => setIdRoom(e.target.value)}
          disabled={isJoining}
        />

        {/* Button dengan loading state */}
        <button
          onClick={handleCreateRoom}
          disabled={isJoining}
          className="w-full mt-6 py-4
             bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500
             text-white font-bold rounded-xl
             transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg
             hover:shadow-cyan-400/30"
        >
          {isJoining ? 'Joining Room...' : 'Join Room'}
        </button>
      </div>
    </div>
  )
}

export default YoutubeJoinContainer

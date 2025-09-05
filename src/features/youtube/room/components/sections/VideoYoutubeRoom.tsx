'use client'
import CustomInput from '@/components/CustomInput'
import { Star } from 'lucide-react'
import SyncedYoutubePlayer from '../organisms/YoutubePlayer'
import { getDatabase, ref, remove } from 'firebase/database'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useYoutubeRoomStore } from '@/store/youtubeRoomStore'

const VideoYoutubeRoom = () => {
  const db = getDatabase()
  const router = useRouter()
  const { roomId, youtubeUrl, setYoutubeUrl } = useYoutubeRoomStore()
  const isOwner = useYoutubeRoomStore((s) => s.isOwner())

  const handleDeleteRoom = async () => {
    if (!roomId) return
    try {
      await remove(ref(db, `platform/youtube/rooms/${roomId}`))
      toast.success('Room deleted successfully')
      router.push('/')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error deleting room: ${error.message}`)
      }
    }
  }

  return (
    <div className="xl:col-span-3">
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20">
        <div
          className="relative rounded-xl overflow-hidden bg-black aspect-video"
          id={`youtube-container-${roomId}`}
        >
          <SyncedYoutubePlayer />
        </div>

        {/* Video Controls/Info */}
        <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
              ))}
            </div>
            <span className="text-white/80 text-sm">Premium Quality</span>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span>Room ID: {roomId}</span>
          </div>
        </div>

        {isOwner && (
          <div className="mt-4 flex flex-col lg:flex-row gap-4">
            <CustomInput
              className="w-full lg:w-[50%]"
              placeholder="Paste a New YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />

            <button className="w-full lg:w-[25%] p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all">
              Set Video
            </button>

            <button
              onClick={handleDeleteRoom}
              className="w-full lg:w-[25%] p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
            >
              Delete Room
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default VideoYoutubeRoom

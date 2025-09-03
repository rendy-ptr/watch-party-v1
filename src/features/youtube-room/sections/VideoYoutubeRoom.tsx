'use client'
import CustomInput from '@/components/CustomInput'
import { Maximize, Star } from 'lucide-react'
import { User } from '@/types/users'
import { getYoutubeId } from '@/lib/getYoutubeId'
import { auth } from '@/lib/firebase'
import SyncedYoutubePlayer from '../organisms/YoutubePlayer'

interface VideoYoutubeRoomProps {
  id: string
  videoUrl: string
  youtubeUrl: string
  setYoutubeUrl: (url: string) => void
  onlineUsersList: User[]
}

const VideoYoutubeRoom = ({
  id,
  videoUrl,
  youtubeUrl,
  setYoutubeUrl,
  onlineUsersList,
}: VideoYoutubeRoomProps) => {
  const currentUid = auth.currentUser?.uid
  const currentUser = onlineUsersList.find((u) => u.id === currentUid)
  const isOwner = currentUser?.role === 'owner'

  const _videoId = getYoutubeId(videoUrl) ?? ''

  return (
    <div className="xl:col-span-3">
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-4 lg:p-6 shadow-2xl border border-white/20">
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
          <SyncedYoutubePlayer roomId={id} isOwner={isOwner} />
          <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors z-20">
            <Maximize className="h-5 w-5 text-white" />
          </button>
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
            <span>Room ID: {id}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <CustomInput
            className="w-full lg:w-[70%]"
            placeholder="Paste a New YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />

          <button
            className="w-full lg:w-[30%] p-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
            disabled={!isOwner} // hanya owner boleh set video
          >
            Set Video
          </button>
        </div>
      </div>
    </div>
  )
}
export default VideoYoutubeRoom

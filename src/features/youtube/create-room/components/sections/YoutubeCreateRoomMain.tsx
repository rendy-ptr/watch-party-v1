'use client'

import CustomInput from '@/components/CustomInput'

import { useCreateRoom } from '../../hooks/useCreateRoom'

const YoutubeCreateRoomMain = () => {
  const { isLoading, createRoomHandler, youtubeUrl, setYoutubeUrl } =
    useCreateRoom()
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Create New Room
      </h2>

      <CustomInput
        label="YouTube URL"
        placeholder="Paste a YouTube URL or video ID"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        disabled={isLoading}
      />

      {/* Button dengan loading state */}
      <button
        onClick={() => createRoomHandler(youtubeUrl)}
        disabled={isLoading}
        className="w-full mt-6 py-4
             bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500
             text-white font-bold rounded-xl
             transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg
             hover:shadow-cyan-400/30"
      >
        {isLoading ? 'Creating Room...' : 'Create Room'}
      </button>
    </div>
  )
}

export default YoutubeCreateRoomMain

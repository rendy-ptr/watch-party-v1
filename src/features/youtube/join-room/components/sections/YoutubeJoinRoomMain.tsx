'use client'

import CustomInput from '@/components/CustomInput'
import { useJoinRoom } from '../../hooks/useJoinRoom'

const YoutubeJoinRoomMain = () => {
  const { idRoom, setIdRoom, isLoading, handleJoinRoom } = useJoinRoom()
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8 mb-8 shadow-2xl hover:bg-white/10 transition-all duration-300">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Join Room
      </h2>

      <CustomInput
        label="ID ROOM"
        placeholder="Paste Room ID"
        value={idRoom}
        onChange={(e) => setIdRoom(e.target.value)}
        disabled={isLoading}
      />

      {/* Button dengan loading state */}
      <button
        onClick={() => handleJoinRoom(idRoom)}
        disabled={isLoading}
        className="w-full mt-6 py-4
             bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500
             text-white font-bold rounded-xl
             transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 shadow-lg
             hover:shadow-cyan-400/30"
      >
        {isLoading ? 'Joining Room...' : 'Join Room'}
      </button>
    </div>
  )
}
export default YoutubeJoinRoomMain

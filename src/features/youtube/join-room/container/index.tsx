'use client'
import YoutubeJoinRoomHeader from '../components/sections/YoutubeJoinRoomHeader'
import YoutubeJoinRoomMain from '../components/sections/YoutubeJoinRoomMain'

const YoutubeJoinContainer = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-20">
      <YoutubeJoinRoomHeader />
      <YoutubeJoinRoomMain />
    </div>
  )
}

export default YoutubeJoinContainer

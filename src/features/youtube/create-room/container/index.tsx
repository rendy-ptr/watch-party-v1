'use client'
import YoutubeCreateRoomHeader from '../components/sections/YoutubeCreateRoomHeader'
import YoutubeCreateRoomMain from '../components/sections/YoutubeCreateRoomMain'

const YouTubeCreateRoomContainer = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-20">
      <YoutubeCreateRoomHeader />
      <YoutubeCreateRoomMain />
    </div>
  )
}

export default YouTubeCreateRoomContainer

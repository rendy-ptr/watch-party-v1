'use client'
import styles from '../../style/youtube-create-section.module.css'

const YoutubeCreateRoomHeader = () => {
  return (
    <div className={`${styles.fadeInUp} mb-8`}>
      <h1 className="text-5xl font-bold text-white mb-6 leading-tight text-center">
        <span className={styles.gradientText}>CirenFlix</span>
      </h1>
    </div>
  )
}

export default YoutubeCreateRoomHeader

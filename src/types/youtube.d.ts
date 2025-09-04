declare global {
  namespace YT {
    interface Player {
      getPlaybackRate(): number
      setPlaybackRate(rate: number): void
      getCurrentTime(): number
      seekTo(seconds: number, allowSeekAhead: boolean): void
      playVideo(): void
      pauseVideo(): void
      getPlayerState(): number
      mute(): void
      unMute(): void
      getVideoData(): {
        video_id: string
      }
      getIframe(): HTMLIFrameElement
    }

    interface PlayerVars {
      mute?: 0 | 1
      autoplay?: 0 | 1
      controls?: 0 | 1 | 2
      disablekb?: 0 | 1
      rel?: 0 | 1
      modestbranding?: 0 | 1
      start?: number
      end?: number
      playsinline?: 0 | 1
      fs?: 0 | 1
      hd?: 0 | 1
      showinfo?: 0 | 1
      iv_load_policy?: 1 | 3
      enablejsapi?: 0 | 1
      origin?: string
    }

    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface PlayerOptions {
      height: string
      width: string
      videoId?: string
      playerVars?: PlayerVars
      events?: {
        onReady?: (event: YouTubeEvent) => void
        onStateChange?: (event: YouTubeEvent) => void
        onError?: (event: YouTubeEvent) => void
        onPlaybackRateChange?: (event: YouTubeEvent) => void
        onPlaybackQualityChange?: (event: YouTubeEvent) => void
      }
    }
  }
}

export {}

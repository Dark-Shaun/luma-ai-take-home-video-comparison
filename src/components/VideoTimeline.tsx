import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

interface VideoTimelineProps {
  leftVideoRef: RefObject<HTMLVideoElement | null>
  rightVideoRef: RefObject<HTMLVideoElement | null>
  isPlaying: boolean
}

const pad = (n: number): string => String(n).padStart(2, '0')

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${pad(s)}`
}

const VideoTimeline = ({ leftVideoRef, rightVideoRef, isPlaying }: VideoTimelineProps) => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverFraction, setHoverFraction] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const playbackIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    const left = leftVideoRef.current
    if (!left) {
      return
    }

    const updateFromVideo = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(left.currentTime)
      }
      if (left.duration && !Number.isNaN(left.duration)) {
        setDuration(left.duration)
      }
    }

    updateFromVideo()
    left.addEventListener('loadedmetadata', updateFromVideo)
    left.addEventListener('durationchange', updateFromVideo)
    left.addEventListener('timeupdate', updateFromVideo)
    left.addEventListener('seeked', updateFromVideo)
    left.addEventListener('play', updateFromVideo)
    left.addEventListener('pause', updateFromVideo)
    left.addEventListener('ended', updateFromVideo)

    return () => {
      left.removeEventListener('loadedmetadata', updateFromVideo)
      left.removeEventListener('durationchange', updateFromVideo)
      left.removeEventListener('timeupdate', updateFromVideo)
      left.removeEventListener('seeked', updateFromVideo)
      left.removeEventListener('play', updateFromVideo)
      left.removeEventListener('pause', updateFromVideo)
      left.removeEventListener('ended', updateFromVideo)
    }
  }, [leftVideoRef])

  useEffect(() => {
    if (playbackIntervalRef.current !== null) {
      window.clearInterval(playbackIntervalRef.current)
      playbackIntervalRef.current = null
    }

    if (!isPlaying) {
      return
    }

    playbackIntervalRef.current = window.setInterval(() => {
      const left = leftVideoRef.current
      if (!left || isDraggingRef.current) {
        return
      }
      setCurrentTime(left.currentTime)
    }, 50)

    return () => {
      if (playbackIntervalRef.current !== null) {
        window.clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
    }
  }, [isPlaying, leftVideoRef])

  const seekTo = useCallback((fraction: number) => {
    if (duration <= 0) {
      return
    }
    const time = Math.max(0, Math.min(fraction, 1)) * duration
    const left = leftVideoRef.current
    const right = rightVideoRef.current
    if (left) left.currentTime = time
    if (right) right.currentTime = time
    setCurrentTime(time)
  }, [duration, leftVideoRef, rightVideoRef])

  const getPosFraction = useCallback((clientX: number): number => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (duration <= 0) {
      return
    }
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    seekTo(getPosFraction(e.clientX))
  }, [duration, getPosFraction, seekTo])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const frac = getPosFraction(e.clientX)
    setHoverFraction(frac)
    if (isDragging) {
      seekTo(frac)
    }
  }, [isDragging, getPosFraction, seekTo])

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false
    setIsDragging(false)
  }, [])

  const handlePointerLeave = useCallback(() => {
    if (!isDragging) {
      setHoverFraction(null)
    }
  }, [isDragging])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="mt-2 flex items-center gap-3 px-1 py-2"
      style={{
        background: 'var(--bg-panel)',
        border: 'var(--border-w) solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <div className="flex items-center gap-1.5 pl-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            background: isPlaying ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: isPlaying ? '0 0 4px var(--success)' : 'none',
          }}
        />
        <span
          className="min-w-[3.5rem] font-mono text-xs font-medium tabular-nums"
          style={{ color: 'var(--text-primary)' }}
        >
          {formatTime(currentTime)}
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative flex-1 py-2"
        style={{ cursor: duration > 0 ? 'pointer' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        role="slider"
        aria-label="Video timeline"
        aria-valuemin={0}
        aria-valuemax={Math.round(Math.max(duration, 0) * 100)}
        aria-valuenow={Math.round(currentTime * 100)}
        tabIndex={0}
      >
        <div
          className="h-[6px] w-full overflow-hidden rounded-full"
          style={{ background: 'var(--interactive)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'var(--accent)',
              transition: isDragging ? 'none' : 'width 80ms linear',
            }}
          />
        </div>

        {hoverFraction !== null && !isDragging ? (
          <div
            className="pointer-events-none absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 font-mono text-[10px]"
            style={{
              left: `${hoverFraction * 100}%`,
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: 'var(--border-w) solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {formatTime(hoverFraction * duration)}
          </div>
        ) : null}

        <div
          className="absolute top-1/2"
          style={{
            left: `${progress}%`,
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.4 : 1})`,
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid var(--accent-text)',
            boxShadow: 'var(--shadow-md)',
            transition: isDragging ? 'transform 100ms' : 'left 80ms linear, transform 150ms',
          }}
        />
      </div>

      <span
        className="min-w-[3.5rem] pr-2 text-right font-mono text-xs tabular-nums"
        style={{ color: 'var(--text-muted)' }}
      >
        {formatTime(duration)}
      </span>
    </div>
  )
}

export default VideoTimeline

import { forwardRef, useState } from 'react'

interface VideoPanelProps {
  title: string
  videoSrc: string
}

const VideoPanel = forwardRef<HTMLVideoElement, VideoPanelProps>(({ title, videoSrc }, ref) => {
  const [reloadKey, setReloadKey] = useState(0)
  const [failedVideoSrc, setFailedVideoSrc] = useState<string | null>(null)
  const hasError = failedVideoSrc === videoSrc

  return (
    <section
      className="overflow-hidden"
      style={{
        background: 'var(--bg-panel)',
        border: 'var(--border-w) solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="py-2 text-center"
        style={{ borderBottom: 'var(--border-w) solid var(--border-subtle)' }}
      >
        <h3
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          {title}
        </h3>
      </div>
      <div className="p-1.5">
        <div
          className="relative overflow-hidden"
          style={{
            background: 'var(--video-bg)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-w) solid var(--border-subtle)',
          }}
        >
          <video
            key={`${videoSrc}-${reloadKey}`}
            ref={ref}
            src={videoSrc}
            preload="auto"
            loop
            muted
            playsInline
            className="aspect-video w-full object-contain"
            aria-label={`${title} video`}
            onError={() => setFailedVideoSrc(videoSrc)}
            onLoadedData={() => {
              if (failedVideoSrc === videoSrc) {
                setFailedVideoSrc(null)
              }
            }}
          />
          {hasError ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
              style={{ background: 'rgba(0, 0, 0, 0.75)' }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>
                Video failed to load
              </p>
              <button
                type="button"
                onClick={() => {
                  setFailedVideoSrc(null)
                  setReloadKey((value) => value + 1)
                }}
                className="px-2.5 py-1 text-[11px] font-semibold transition-colors"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent)'
                }}
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
})

VideoPanel.displayName = 'VideoPanel'

export default VideoPanel

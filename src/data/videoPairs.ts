import type { VideoPair } from '../types/evaluation'

const totalPairs = 36

export const videoPairs: VideoPair[] = Array.from({ length: totalPairs }, (_, index) => {
  const suffix = String(index).padStart(3, '0')
  const filename = `segment_${suffix}.mp4`

  return {
    id: index + 1,
    filename,
    prompt: `Segment ${index + 1}`,
    videoAUrl: `/videos/exp_a/${filename}`,
    videoBUrl: `/videos/exp_b/${filename}`,
  }
})

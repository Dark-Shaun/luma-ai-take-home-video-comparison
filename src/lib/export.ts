import type { RatingEntry, SideMapping, VideoPair } from '../types/evaluation'

const downloadTextFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const downloadJson = (payload: object, filename: string): void => {
  downloadTextFile(JSON.stringify(payload, null, 2), filename, 'application/json')
}

export interface CsvRow {
  pairId: number
  filename: string
  prompt: string
  leftExperiment: string
  rightExperiment: string
  decision: string
  winner: string
  ratedAt: string
}

const escapeCsv = (value: string | number): string => {
  const text = String(value).replaceAll('"', '""')
  return `"${text}"`
}

export const buildCsvRows = (
  pairs: VideoPair[],
  ratingsByPairId: Record<number, RatingEntry>,
  sideMappingByPairId: Record<number, SideMapping>,
): CsvRow[] =>
  pairs
    .filter((pair) => ratingsByPairId[pair.id])
    .map((pair) => {
      const rating = ratingsByPairId[pair.id]
      const mapping = sideMappingByPairId[pair.id]

      return {
        pairId: pair.id,
        filename: pair.filename,
        prompt: pair.prompt,
        leftExperiment: mapping.leftExperiment,
        rightExperiment: mapping.rightExperiment,
        decision: rating.decision,
        winner: rating.winner,
        ratedAt: rating.ratedAt,
      }
    })

export const downloadCsv = (rows: CsvRow[], filename: string): void => {
  const headers = [
    'pairId',
    'filename',
    'prompt',
    'leftExperiment',
    'rightExperiment',
    'decision',
    'winner',
    'ratedAt',
  ]

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.pairId,
        row.filename,
        row.prompt,
        row.leftExperiment,
        row.rightExperiment,
        row.decision,
        row.winner,
        row.ratedAt,
      ]
        .map((value) => escapeCsv(value))
        .join(','),
    ),
  ].join('\n')

  downloadTextFile(csv, filename, 'text/csv;charset=utf-8')
}

import { useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Navbar from '../components/Navbar'
import type { Theme } from '../types/evaluation'

export interface SummaryRow {
  pairId: number
  filename: string
  prompt: string
  leftExperiment: string
  rightExperiment: string
  decision: string
  winner: string
}

interface SummaryPageProps {
  theme: Theme
  onToggleTheme: () => void
  onRestart: () => void
  onBackToRating: () => void
  onOpenPair: (pairId: number) => void
  onExportJson: () => void
  onExportCsv: () => void
  totalPairs: number
  ratedPairs: number
  winnerA: number
  winnerB: number
  ties: number
  rows: SummaryRow[]
}

const formatPercent = (value: number, total: number): string => {
  if (total === 0) {
    return '0%'
  }

  return `${Math.round((value / total) * 100)}%`
}

const SummaryPage = ({
  theme,
  onToggleTheme,
  onRestart,
  onBackToRating,
  onOpenPair,
  onExportJson,
  onExportCsv,
  totalPairs,
  ratedPairs,
  winnerA,
  winnerB,
  ties,
  rows,
}: SummaryPageProps) => {
  const [ratedOnly, setRatedOnly] = useState(false)
  const [winnerFilter, setWinnerFilter] = useState<'all' | 'A' | 'B' | 'tie' | 'not_rated'>('all')

  const leader = winnerA >= winnerB ? 'A' : 'B'
  const leadPct = formatPercent(Math.max(winnerA, winnerB), ratedPairs)
  const completionPct = formatPercent(ratedPairs, totalPairs)
  const decisiveCount = winnerA + winnerB
  const decisivePct = formatPercent(decisiveCount, Math.max(ratedPairs, 1))
  const pendingCount = Math.max(totalPairs - ratedPairs, 0)

  const outcomeData = useMemo(
    () => [
      { name: 'Experiment A', value: winnerA, color: '#6366F1' },
      { name: 'Experiment B', value: winnerB, color: '#8B5CF6' },
      { name: 'Tie', value: ties, color: '#64748B' },
    ],
    [winnerA, winnerB, ties],
  )

  const coverageData = useMemo(
    () => [
      { name: 'Rated', value: ratedPairs, color: '#10B981' },
      { name: 'Pending', value: pendingCount, color: '#64748B' },
    ],
    [pendingCount, ratedPairs],
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (ratedOnly && row.winner === 'not_rated') {
        return false
      }
      if (winnerFilter !== 'all' && row.winner !== winnerFilter) {
        return false
      }
      return true
    })
  }, [ratedOnly, rows, winnerFilter])

  const pillStyle = {
    background: 'var(--interactive)',
    color: 'var(--text-secondary)',
    border: 'var(--border-w) solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
  }

  const accentBtnStyle = {
    background: 'var(--accent)',
    color: 'var(--accent-text)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-sm)',
  }

  return (
    <div className="min-h-screen">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Results</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{ratedPairs} of {totalPairs} pairs evaluated</p>
        </div>

        <div
          className="mb-6 p-6 text-center"
          style={{
            background: 'var(--accent-subtle)',
            border: 'var(--border-w) solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Overall leader</p>
          <p className="mt-1 text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Experiment {leader}</p>
          <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--accent)' }}>{leadPct} win rate</p>
        </div>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          {[
            { label: 'Experiment A', value: formatPercent(winnerA, ratedPairs), sub: `${winnerA} wins` },
            { label: 'Experiment B', value: formatPercent(winnerB, ratedPairs), sub: `${winnerB} wins` },
            { label: 'Ties', value: formatPercent(ties, ratedPairs), sub: `${ties} draws` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4"
              style={{
                background: 'var(--bg-panel)',
                border: 'var(--border-w) solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.sub}</p>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <div
            className="p-4 lg:col-span-2"
            style={{
              background: 'var(--bg-panel)',
              border: 'var(--border-w) solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Outcome distribution
            </p>
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {outcomeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: 'var(--border-w) solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {outcomeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {item.name}: <span style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-4"
            style={{
              background: 'var(--bg-panel)',
              border: 'var(--border-w) solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Evaluation quality
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Coverage</span>
                <span style={{ color: 'var(--text-primary)' }}>{completionPct}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Decisive votes</span>
                <span style={{ color: 'var(--text-primary)' }}>{decisivePct}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Pending pairs</span>
                <span style={{ color: 'var(--text-primary)' }}>{pendingCount}</span>
              </div>
            </div>
            <div className="mt-5 h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coverageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={58}
                    stroke="none"
                  >
                    {coverageData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBackToRating}
            aria-label="Back to rating"
            className="px-3.5 py-2 text-xs font-medium transition-colors"
            style={pillStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--interactive-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--interactive)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {'\u2190'} Back to Rating
          </button>
          <button
            type="button"
            onClick={onExportJson}
            aria-label="Export JSON"
            className="px-3.5 py-2 text-xs font-semibold transition-colors"
            style={accentBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            aria-label="Export CSV"
            className="px-3.5 py-2 text-xs font-semibold transition-colors"
            style={accentBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onRestart}
            aria-label="Restart evaluation"
            className="px-3.5 py-2 text-xs font-semibold transition-colors"
            style={{
              background: 'var(--danger-subtle)',
              color: 'var(--danger)',
              border: 'var(--border-w) solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'var(--accent-text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)' }}
          >
            Restart
          </button>
        </section>

        <section
          className="mb-4 flex flex-wrap items-center gap-2 p-3"
          style={{
            background: 'var(--bg-panel)',
            border: 'var(--border-w) solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <button
            type="button"
            onClick={() => setRatedOnly((value) => !value)}
            className="px-2.5 py-1.5 text-xs font-medium transition-colors"
            style={{
              ...pillStyle,
              background: ratedOnly ? 'var(--accent-subtle)' : 'var(--interactive)',
              color: ratedOnly ? 'var(--accent)' : 'var(--text-secondary)',
              border: `var(--border-w) solid ${ratedOnly ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            Rated only {ratedOnly ? 'on' : 'off'}
          </button>
          {(['all', 'A', 'B', 'tie', 'not_rated'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setWinnerFilter(filter)}
              className="px-2.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                ...pillStyle,
                background: winnerFilter === filter ? 'var(--accent-subtle)' : 'var(--interactive)',
                color: winnerFilter === filter ? 'var(--accent)' : 'var(--text-secondary)',
                border: `var(--border-w) solid ${winnerFilter === filter ? 'var(--accent)' : 'var(--border-subtle)'}`,
              }}
            >
              {filter === 'all' ? 'All winners' : filter === 'not_rated' ? 'Not rated' : `Winner ${filter}`}
            </button>
          ))}
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
            Showing {filteredRows.length} of {rows.length}
          </span>
        </section>

        <section
          className="overflow-hidden"
          style={{
            background: 'var(--bg-panel)',
            border: 'var(--border-w) solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr style={{ borderBottom: 'var(--border-w) solid var(--border-default)' }}>
                  {['#', 'Filename', 'Prompt', 'Left', 'Right', 'Decision', 'Winner'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      No pairs match the selected filters.
                    </td>
                  </tr>
                ) : filteredRows.map((row, i) => (
                  <tr
                    key={row.pairId}
                    style={{
                      borderBottom: 'var(--border-w) solid var(--border-subtle)',
                      background: i % 2 === 1 ? 'var(--bg-elevated)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--text-muted)' }}>
                      <button
                        type="button"
                        onClick={() => onOpenPair(row.pairId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                        style={{ color: 'var(--accent)' }}
                      >
                        {row.pairId}
                        <span>{'\u2192'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{row.filename}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>{row.prompt}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-muted)' }}>{row.leftExperiment}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-muted)' }}>{row.rightExperiment}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>{row.decision}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={
                          row.winner === 'not_rated'
                            ? { color: 'var(--text-muted)' }
                            : row.winner === 'tie'
                              ? { background: 'var(--interactive)', color: 'var(--text-secondary)', border: 'var(--border-w) solid var(--border-subtle)' }
                              : { background: 'var(--accent-subtle)', color: 'var(--accent)', border: 'var(--border-w) solid var(--accent)' }
                        }
                      >
                        {row.winner === 'not_rated' ? '\u2014' : row.winner === 'tie' ? 'Tie' : `Exp ${row.winner}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default SummaryPage

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import HelpModal from './components/HelpModal'
import { videoPairs } from './data/videoPairs'
import { useHotkeys } from './hooks/useHotkeys'
import { buildCsvRows, downloadCsv, downloadJson } from './lib/export'
import { clearSessionState, createDefaultPreferences, loadSessionState, saveSessionState } from './lib/storage'
import RatingPage from './pages/RatingPage'
import StartPage from './pages/StartPage'
import SummaryPage, { type SummaryRow } from './pages/SummaryPage'
import type { Decision, HistoryEntry, RatingEntry, SessionState, SideMapping, Winner } from './types/evaluation'

const totalPairs = videoPairs.length
const AUTO_ADVANCE_DELAY_MS = 200

const createSideMappingByPairId = (): Record<number, SideMapping> =>
  Object.fromEntries(
    videoPairs.map((pair) => {
      const leftExperiment = Math.random() > 0.5 ? 'A' : 'B'
      const rightExperiment = leftExperiment === 'A' ? 'B' : 'A'
      return [pair.id, { leftExperiment, rightExperiment }]
    }),
  )

const createInitialSession = (): SessionState => ({
  currentIndex: 0,
  ratingsByPairId: {},
  sideMappingByPairId: createSideMappingByPairId(),
  history: [],
  preferences: createDefaultPreferences(),
})

const getWinnerFromDecision = (decision: Decision, sideMapping: SideMapping): Winner => {
  if (decision === 'tie') {
    return 'tie'
  }

  return decision === 'left' ? sideMapping.leftExperiment : sideMapping.rightExperiment
}

const App = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState<SessionState>(() => loadSessionState() ?? createInitialSession())
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [undoToast, setUndoToast] = useState<{ kind: 'success' | 'info'; message: string } | null>(null)
  const [pendingAutoPlay, setPendingAutoPlay] = useState(false)
  const autoAdvanceTimeoutRef = useRef<number | null>(null)

  const leftVideoRef = useRef<HTMLVideoElement>(null)
  const rightVideoRef = useRef<HTMLVideoElement>(null)

  const currentPair = videoPairs[session.currentIndex]
  const sideMapping = session.sideMappingByPairId[currentPair.id]
  const currentRating = session.ratingsByPairId[currentPair.id] ?? null

  const leftVideoSrc =
    sideMapping.leftExperiment === 'A' ? currentPair.videoAUrl : currentPair.videoBUrl
  const rightVideoSrc =
    sideMapping.rightExperiment === 'A' ? currentPair.videoAUrl : currentPair.videoBUrl

  const ratedPairsCount = Object.keys(session.ratingsByPairId).length
  const progressPercent = Math.round((ratedPairsCount / totalPairs) * 100)

  const isOnRating = location.pathname === '/evaluate'

  useEffect(() => {
    saveSessionState(session)
  }, [session])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', session.preferences.theme)
  }, [session.preferences.theme])

  useEffect(() => {
    if (!pendingAutoPlay) {
      return
    }

    const left = leftVideoRef.current
    const right = rightVideoRef.current
    if (!left || !right) {
      return
    }

    const tryPlay = () => {
      if (left.readyState >= 2 && right.readyState >= 2) {
        left.currentTime = 0
        right.currentTime = 0
        void left.play()
        void right.play()
        setIsPlaying(true)
        setPendingAutoPlay(false)
        return
      }

      requestAnimationFrame(tryPlay)
    }

    requestAnimationFrame(tryPlay)
  }, [pendingAutoPlay, session.currentIndex])

  useEffect(() => {
    if (!undoToast) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setUndoToast(null)
    }, 2200)

    return () => window.clearTimeout(timeoutId)
  }, [undoToast])

  useEffect(() => {
    if (location.pathname !== '/summary') {
      return
    }
    if (ratedPairsCount === totalPairs) {
      return
    }
    const toastTimeoutId = window.setTimeout(() => {
      setUndoToast({ kind: 'info', message: `Complete all ${totalPairs} pairs to view final summary.` })
    }, 0)
    navigate('/evaluate', { replace: true })
    return () => window.clearTimeout(toastTimeoutId)
  }, [location.pathname, navigate, ratedPairsCount])

  useEffect(() => {
    if (!isOnRating) {
      return
    }

    const nextPair = videoPairs[session.currentIndex + 1]
    if (!nextPair) {
      return
    }

    const nextMapping = session.sideMappingByPairId[nextPair.id]
    const nextLeftSrc = nextMapping.leftExperiment === 'A' ? nextPair.videoAUrl : nextPair.videoBUrl
    const nextRightSrc = nextMapping.rightExperiment === 'A' ? nextPair.videoAUrl : nextPair.videoBUrl

    const preloadLeft = document.createElement('video')
    const preloadRight = document.createElement('video')
    preloadLeft.preload = 'metadata'
    preloadRight.preload = 'metadata'
    preloadLeft.src = nextLeftSrc
    preloadRight.src = nextRightSrc
  }, [session.currentIndex, session.sideMappingByPairId, isOnRating])

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current !== null) {
      window.clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimeout()
    }
  }, [clearAutoAdvanceTimeout])

  const applySessionUpdate = useCallback((updater: (previous: SessionState) => SessionState) => {
    setSession((previous) => updater(previous))
  }, [])

  const handleToggleTheme = useCallback(() => {
    applySessionUpdate((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        theme: previous.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }))
  }, [applySessionUpdate])

  const handleJumpToPair = useCallback((index: number) => {
    clearAutoAdvanceTimeout()
    setIsPlaying(false)
    setPendingAutoPlay(false)
    applySessionUpdate((previous) => ({
      ...previous,
      currentIndex: index,
    }))
  }, [applySessionUpdate, clearAutoAdvanceTimeout])

  const handleToggleAutoAdvance = useCallback(() => {
    clearAutoAdvanceTimeout()
    setPendingAutoPlay(false)
    applySessionUpdate((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        autoAdvance: !previous.preferences.autoAdvance,
      },
    }))
  }, [applySessionUpdate, clearAutoAdvanceTimeout])

  const handlePrevious = useCallback(() => {
    clearAutoAdvanceTimeout()
    setIsPlaying(false)
    setPendingAutoPlay(false)
    leftVideoRef.current?.pause()
    rightVideoRef.current?.pause()
    applySessionUpdate((previous) => {
      if (previous.currentIndex === 0) {
        return previous
      }

      return {
        ...previous,
        currentIndex: previous.currentIndex - 1,
      }
    })
  }, [applySessionUpdate, clearAutoAdvanceTimeout])

  const handleNext = useCallback(() => {
    clearAutoAdvanceTimeout()
    setIsPlaying(false)
    setPendingAutoPlay(false)
    leftVideoRef.current?.pause()
    rightVideoRef.current?.pause()
    applySessionUpdate((previous) => {
      if (previous.currentIndex >= totalPairs - 1) {
        return previous
      }

      return {
        ...previous,
        currentIndex: previous.currentIndex + 1,
      }
    })
  }, [applySessionUpdate, clearAutoAdvanceTimeout])

  const handleDecision = useCallback(
    (decision: Decision) => {
      clearAutoAdvanceTimeout()
      setIsPlaying(false)
      setPendingAutoPlay(false)
      leftVideoRef.current?.pause()
      rightVideoRef.current?.pause()
      const shouldAutoAdvance =
        session.preferences.autoAdvance && session.currentIndex < totalPairs - 1
      setSession((previous) => {
        const pair = videoPairs[previous.currentIndex]
        const pairSideMapping = previous.sideMappingByPairId[pair.id]
        const winner = getWinnerFromDecision(decision, pairSideMapping)
        const previousRating = previous.ratingsByPairId[pair.id] ?? null

        const rating: RatingEntry = {
          pairId: pair.id,
          decision,
          winner,
          ratedAt: new Date().toISOString(),
        }

        const historyEntry: HistoryEntry = {
          pairId: pair.id,
          previousRating,
          previousIndex: previous.currentIndex,
        }

        return {
          ...previous,
          currentIndex: previous.currentIndex,
          ratingsByPairId: {
            ...previous.ratingsByPairId,
            [pair.id]: rating,
          },
          history: [...previous.history, historyEntry],
        }
      })

      if (shouldAutoAdvance) {
        autoAdvanceTimeoutRef.current = window.setTimeout(() => {
          autoAdvanceTimeoutRef.current = null
          setSession((previous) => {
            if (previous.currentIndex >= totalPairs - 1) {
              return previous
            }
            return {
              ...previous,
              currentIndex: previous.currentIndex + 1,
            }
          })
          setPendingAutoPlay(true)
        }, AUTO_ADVANCE_DELAY_MS)
      }
    },
    [clearAutoAdvanceTimeout, session.currentIndex, session.preferences.autoAdvance],
  )

  const handleUndo = useCallback(() => {
    clearAutoAdvanceTimeout()
    setIsPlaying(false)
    setPendingAutoPlay(false)
    leftVideoRef.current?.pause()
    rightVideoRef.current?.pause()
    setSession((previous) => {
      const currentPairId = videoPairs[previous.currentIndex].id
      const targetHistoryIndex = (() => {
        for (let i = previous.history.length - 1; i >= 0; i -= 1) {
          if (previous.history[i].pairId === currentPairId) {
            return i
          }
        }
        return -1
      })()

      if (targetHistoryIndex === -1) {
        setUndoToast({ kind: 'info', message: 'Nothing to undo on this pair' })
        return previous
      }

      const targetAction = previous.history[targetHistoryIndex]
      const nextRatings = { ...previous.ratingsByPairId }

      if (targetAction.previousRating) {
        nextRatings[targetAction.pairId] = targetAction.previousRating
      } else {
        delete nextRatings[targetAction.pairId]
      }

      setUndoToast({ kind: 'success', message: 'Undid vote for this pair' })

      return {
        ...previous,
        ratingsByPairId: nextRatings,
        history: previous.history.filter((_, index) => index !== targetHistoryIndex),
      }
    })
  }, [clearAutoAdvanceTimeout])

  const handleTogglePlayback = useCallback(() => {
    const left = leftVideoRef.current
    const right = rightVideoRef.current

    if (!left || !right) {
      return
    }

    if (isPlaying) {
      left.pause()
      right.pause()
      setIsPlaying(false)
      return
    }

    const targetTime = Math.min(left.currentTime, right.currentTime)
    left.currentTime = targetTime
    right.currentTime = targetTime
    void left.play()
    void right.play()
    setIsPlaying(true)
  }, [isPlaying])

  const handleRestart = useCallback(() => {
    clearAutoAdvanceTimeout()
    clearSessionState()
    setSession(createInitialSession())
    setIsHelpOpen(false)
    setIsPlaying(false)
    setPendingAutoPlay(false)
    navigate('/')
  }, [clearAutoAdvanceTimeout, navigate])

  const summaryRows: SummaryRow[] = useMemo(
    () =>
      videoPairs.map((pair) => {
        const rating = session.ratingsByPairId[pair.id]
        const mapping = session.sideMappingByPairId[pair.id]

        return {
          pairId: pair.id,
          filename: pair.filename,
          prompt: pair.prompt,
          leftExperiment: mapping.leftExperiment,
          rightExperiment: mapping.rightExperiment,
          decision: rating?.decision ?? 'not_rated',
          winner: rating?.winner ?? 'not_rated',
        }
      }),
    [session.ratingsByPairId, session.sideMappingByPairId],
  )

  const winnerA = Object.values(session.ratingsByPairId).filter((rating) => rating.winner === 'A').length
  const winnerB = Object.values(session.ratingsByPairId).filter((rating) => rating.winner === 'B').length
  const ties = Object.values(session.ratingsByPairId).filter((rating) => rating.winner === 'tie').length

  const handleExportJson = useCallback(() => {
    const payload = {
      generatedAt: new Date().toISOString(),
      totalPairs,
      ratedPairs: ratedPairsCount,
      winnerA,
      winnerB,
      ties,
      rows: summaryRows,
    }

    downloadJson(payload, 'evaluation-results.json')
  }, [ratedPairsCount, summaryRows, ties, winnerA, winnerB])

  const handleExportCsv = useCallback(() => {
    const csvRows = buildCsvRows(videoPairs, session.ratingsByPairId, session.sideMappingByPairId)
    downloadCsv(csvRows, 'evaluation-results.csv')
  }, [session.ratingsByPairId, session.sideMappingByPairId])

  useHotkeys(
    {
      onLeftDecision: () => handleDecision('left'),
      onTieDecision: () => handleDecision('tie'),
      onRightDecision: () => handleDecision('right'),
      onPrevious: handlePrevious,
      onNext: handleNext,
      onTogglePlayback: handleTogglePlayback,
      onToggleHelp: () => setIsHelpOpen((value) => !value),
      onUndo: handleUndo,
    },
    isOnRating,
  )

  return (
    <div className="min-h-screen antialiased" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
      <Routes>
        <Route
          path="/"
          element={
            <StartPage
              totalPairs={totalPairs}
              ratedPairs={ratedPairsCount}
              theme={session.preferences.theme}
              onStart={() => navigate('/evaluate')}
              onRestart={handleRestart}
              onToggleTheme={handleToggleTheme}
            />
          }
        />
        <Route
          path="/evaluate"
          element={
            <RatingPage
              pair={currentPair}
              pairNumber={session.currentIndex + 1}
              totalPairs={totalPairs}
              progressPercent={progressPercent}
              currentIndex={session.currentIndex}
              currentDecision={currentRating?.decision ?? null}
              leftVideoSrc={leftVideoSrc}
              rightVideoSrc={rightVideoSrc}
              isPlaying={isPlaying}
              autoAdvance={session.preferences.autoAdvance}
              theme={session.preferences.theme}
              canGoPrevious={session.currentIndex > 0}
              canGoNext={session.currentIndex < totalPairs - 1}
              allPairs={videoPairs}
              ratingsByPairId={session.ratingsByPairId}
              onJumpToPair={handleJumpToPair}
              onToggleTheme={handleToggleTheme}
              onToggleAutoAdvance={handleToggleAutoAdvance}
              onChooseLeft={() => handleDecision('left')}
              onChooseTie={() => handleDecision('tie')}
              onChooseRight={() => handleDecision('right')}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onTogglePlayback={handleTogglePlayback}
              onOpenHelp={() => setIsHelpOpen(true)}
              onUndo={handleUndo}
              undoToast={undoToast}
              canOpenSummary={ratedPairsCount === totalPairs}
              onOpenSummary={() => navigate('/summary')}
              leftVideoRef={leftVideoRef}
              rightVideoRef={rightVideoRef}
            />
          }
        />
        <Route
          path="/summary"
          element={
            <SummaryPage
              theme={session.preferences.theme}
              onToggleTheme={handleToggleTheme}
              onRestart={handleRestart}
              onBackToRating={() => navigate('/evaluate')}
              onOpenPair={(pairId) => {
                handleJumpToPair(pairId - 1)
                navigate('/evaluate')
              }}
              onExportJson={handleExportJson}
              onExportCsv={handleExportCsv}
              totalPairs={totalPairs}
              ratedPairs={ratedPairsCount}
              winnerA={winnerA}
              winnerB={winnerB}
              ties={ties}
              rows={summaryRows}
            />
          }
        />
      </Routes>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}

export default App

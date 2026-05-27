import { useState, useEffect } from 'react'
import { parseSeries, COLORS, findVideo, WORKOUTS } from '../data'
import SeriesCard from './SeriesCard'
import VideoModal from './VideoModal'
import { savePeso, getPesos, savePR, getPRs } from '../api'

const LS_WEIGHTS_KEY = 'leotreino-weights'

function loadWeights() {
  try { return JSON.parse(localStorage.getItem(LS_WEIGHTS_KEY) || '{}') } catch { return {} }
}

function saveWeightsLS(data) { localStorage.setItem(LS_WEIGHTS_KEY, JSON.stringify(data)) }

export default function ExerciseBlock({ exercise, index, forceExpand, workoutKey, onCompleteSeries, activeTimer }) {
  const [expanded, setExpanded] = useState(false)
  const [completedSeries, setCompletedSeries] = useState({})
  const [showVideo, setShowVideo] = useState(false)
  const [savedWeights, setSavedWeights] = useState({})
  const [savedReps, setSavedReps] = useState({})

  const parsed = exercise.isometric ? [] : parseSeries(exercise.series || '')
  const totalSeries = exercise.isometric ? exercise.sets : parsed.length
  const doneCount = Object.keys(completedSeries).length
  const allDone = doneCount === totalSeries && totalSeries > 0
  const isOpen = expanded || forceExpand
  const videoId = findVideo(exercise.name)
  const dia = WORKOUTS[workoutKey]?.day || ''

  useEffect(() => {
    let cancelled = false
    async function load() {
      const fromApi = await getPesos(dia)
      if (!cancelled && fromApi && fromApi.length > 0) {
        const w = {}
        const r = {}
        fromApi.forEach(row => {
          if (row.exercicio_index === index) {
            w[row.serie_index] = row.peso
            r[row.serie_index] = row.reps
          }
        })
        setSavedWeights(w)
        setSavedReps(r)
        return
      }
      const ls = loadWeights()
      const wKey = `${workoutKey}-${index}`
      if (ls[wKey]) {
        setSavedWeights(ls[wKey].weights || {})
        setSavedReps(ls[wKey].reps || {})
      }
    }
    load()
    return () => { cancelled = true }
  }, [workoutKey, index, dia])

  const handleComplete = (seriesIndex, reps, peso) => {
    setCompletedSeries(p => ({ ...p, [seriesIndex]: true }))

    if (peso || reps) {
      const pesoNum = parseFloat(peso) || 0
      const repsNum = parseInt(reps) || 0

      const wKey = `${workoutKey}-${index}`
      const ls = loadWeights()
      const existing = ls[wKey] || { weights: {}, reps: {} }
      if (peso) existing.weights[seriesIndex] = peso
      if (reps) existing.reps[seriesIndex] = reps
      ls[wKey] = existing
      saveWeightsLS(ls)
      setSavedWeights(existing.weights)
      setSavedReps(existing.reps)

      savePeso({ dia, exercicio_index: index, serie_index: seriesIndex, peso: pesoNum, reps: repsNum })
        .catch(() => {})

      ;(async () => {
        const prs = await getPRs()
        if (prs) {
          const currentPR = prs.find(p => p.dia === dia && p.exercicio_index === index)
          if (!currentPR || pesoNum > parseFloat(currentPR.peso)) {
            savePR({ dia, exercicio_index: index, peso: pesoNum }).catch(() => {})
          }
        }
      })()
    }

    const color = parsed[seriesIndex]?.color
    if (color && COLORS[color]) {
      onCompleteSeries(index, seriesIndex, color)
    }
  }

  return (
    <>
      <div style={{
        background: allDone ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.03)',
        borderRadius: 14, marginBottom: 12, overflow: 'hidden',
        border: allDone ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        <div onClick={() => setExpanded(!expanded)} style={{
          padding: '14px 16px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 10,
        }}>
          <span style={{
            background: 'rgba(255,255,255,0.08)', color: '#94a3b8',
            fontSize: 12, fontWeight: 800, minWidth: 24, height: 24,
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{index + 1}</span>
          <span style={{ flex: 1, color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>
            {exercise.name}
          </span>
          {videoId && (
            <button onClick={(e) => { e.stopPropagation(); setShowVideo(true) }} style={{
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, width: 30, height: 30, color: '#ef4444',
              fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }} title="Ver video">▶</button>
          )}
          <span style={{
            fontSize: 11, color: allDone ? '#4ade80' : '#64748b',
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, minWidth: 36, textAlign: 'center',
          }}>
            {doneCount}/{totalSeries}
          </span>
          <span style={{ fontSize: 12, color: '#475569' }}>{isOpen ? '▲' : '▼'}</span>
        </div>

        {isOpen && (
          <div style={{ padding: '4px 14px 14px', color: '#94a3b8' }}>
            {exercise.isometric ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px',
                fontSize: 12, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace",
              }}>
                Isometrico: {exercise.sets} x {exercise.duration}
              </div>
            ) : parsed.length > 0 ? (
              <>
                {parsed.map((s, i) => (
                  <SeriesCard
                    key={i}
                    seriesData={s}
                    index={i}
                    completed={!!completedSeries[i]}
                    savedPeso={savedWeights[i] || ''}
                    savedReps={savedReps[i] || ''}
                    onComplete={(reps, peso) => handleComplete(i, reps, peso)}
                  />
                ))}
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#fca5a5' }}>
                Formato de serie invalido: {String(exercise.series || '')}
              </div>
            )}
          </div>
        )}
      </div>

      {showVideo && (
        <VideoModal
          videoId={videoId}
          title={exercise.name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  )
}

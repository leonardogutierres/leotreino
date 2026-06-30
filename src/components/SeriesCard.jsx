import { useState, useEffect } from 'react'
import { COLORS } from '../data'

export default function SeriesCard({ seriesData, index, completed, savedPeso, savedReps, onComplete }) {
  const [reps, setReps] = useState('')
  const [peso, setPeso] = useState('')
  const color = COLORS[seriesData?.color] || {
    bg: 'rgba(148,163,184,0.12)',
    border: '#64748b',
    text: '#cbd5e1',
    label: 'SERIE',
    emoji: '⚪',
  }

  useEffect(() => {
    if (savedPeso) setPeso(String(savedPeso))
  }, [savedPeso])

  useEffect(() => {
    if (savedReps) setReps(String(savedReps))
  }, [savedReps])

  return (
    <div style={{
      background: completed ? 'rgba(255,255,255,0.02)' : color.bg,
      borderLeft: `4px solid ${completed ? '#334155' : color.border}`,
      borderRadius: 10, padding: '12px 14px', marginBottom: 8,
      opacity: completed ? 0.5 : 1, transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          background: completed ? '#334155' : color.border, color: completed ? '#64748b' : '#fff',
          fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
        }}>S{index + 1}</span>
        <span style={{ fontSize: 10, color: completed ? '#475569' : color.text, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {color.emoji} {color.label}
        </span>
        <span style={{ fontSize: 11, color: '#64748b', fontFamily: "'JetBrains Mono', monospace", marginLeft: 'auto' }}>
          {seriesData?.reps || '-'} reps
        </span>
      </div>

      {!completed && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Reps</label>
            <input
              type="number" placeholder={savedReps || seriesData?.reps || ''} value={reps}
              onChange={e => setReps(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>Peso</label>
            <input
              type="number" placeholder={savedPeso || 'kg'} value={peso}
              onChange={e => setPeso(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button onClick={() => onComplete(reps, peso)} style={{
            background: color.border, color: '#fff', border: 'none', borderRadius: 10,
            width: 42, height: 42, fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 14, flexShrink: 0,
          }}>→</button>
        </div>
      )}

      {completed && (
        <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 600, animation: 'checkPop 0.3s ease-out' }}>
          ✓ Concluída{peso ? ` · ${peso}kg` : ''}{reps ? ` · ${reps} reps` : ''}
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
  padding: '8px 10px', color: '#e2e8f0', fontSize: 15, fontWeight: 700,
  fontFamily: "'JetBrains Mono', monospace", outline: 'none',
}

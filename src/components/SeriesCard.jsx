import { useState, useEffect } from 'react'
import { COLORS } from '../data'

export default function SeriesCard({ seriesData, index, completed, savedPeso, savedReps, onComplete, onUndo }) {
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

  const quickFillPeso = () => {
    if (savedPeso) setPeso(String(savedPeso))
  }

  const quickFillReps = () => {
    if (savedReps) setReps(String(savedReps))
  }

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
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <label style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Reps</label>
              {savedReps && !reps && (
                <button onClick={quickFillReps} style={{
                  fontSize: 9, background: 'rgba(249,115,22,0.12)', color: '#f97316',
                  border: '1px solid rgba(249,115,22,0.25)', borderRadius: 4,
                  padding: '1px 6px', cursor: 'pointer', fontWeight: 700,
                }}>{savedReps}</button>
              )}
            </div>
            <input
              type="number" placeholder={savedReps || seriesData?.reps || ''} value={reps}
              onChange={e => setReps(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <label style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Peso</label>
              {savedPeso && !peso && (
                <button onClick={quickFillPeso} style={{
                  fontSize: 9, background: 'rgba(249,115,22,0.12)', color: '#f97316',
                  border: '1px solid rgba(249,115,22,0.25)', borderRadius: 4,
                  padding: '1px 6px', cursor: 'pointer', fontWeight: 700,
                }}>{savedPeso}kg</button>
              )}
            </div>
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
            flexShrink: 0, alignSelf: 'flex-end', marginBottom: 1,
          }}>→</button>
        </div>
      )}

      {completed && (
        <div onClick={onUndo} style={{ fontSize: 10, color: '#4ade80', fontWeight: 600, animation: 'checkPop 0.3s ease-out', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>✓ Concluída{peso ? ` · ${peso}kg` : ''}{reps ? ` · ${reps} reps` : ''}</span>
          <span style={{ fontSize: 9, color: '#64748b', textDecoration: 'underline' }}>desfazer</span>
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

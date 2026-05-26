import { useState } from 'react'
import { WORKOUTS, COLORS, DAYS } from '../data'
import ExerciseBlock from './ExerciseBlock'
import SystemInfo from './SystemInfo'

export default function WorkoutView({ workoutKey, onBack, showInfo, onCloseInfo }) {
  const [expandedAll, setExpandedAll] = useState(false)
  const workout = WORKOUTS[workoutKey]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0e1a, #0f172a)', paddingBottom: 40 }}>
      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={btnStyle}>←</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#f97316', fontFamily: "'JetBrains Mono', monospace" }}>
            {workout.name}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {workout.subtitle} · {workout.day}
          </div>
        </div>
        <button onClick={() => setExpandedAll(!expandedAll)} style={btnStyle}>
          {expandedAll ? '⊟' : '⊞'}
        </button>
        <button onClick={onCloseInfo} style={btnStyle}>?</button>
      </div>

      {/* Color legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16,
        padding: '10px', fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 1, flexWrap: 'wrap',
      }}>
        {Object.entries(COLORS).map(([k, c]) => (
          <span key={k} style={{ color: c.text }}>{c.emoji} {c.label}</span>
        ))}
      </div>

      {/* Exercises */}
      <div style={{ padding: '8px 14px', maxWidth: 500, margin: '0 auto' }}>
        {workout.exercises.map((ex, i) => (
          <ExerciseBlock key={i} exercise={ex} index={i} forceExpand={expandedAll} />
        ))}
      </div>

      {/* Bottom links */}
      <div style={{ textAlign: 'center', marginTop: 20, paddingBottom: 20 }}>
        <a href="/remedios.html" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none', marginRight: 16 }}>💊 Remédios</a>
        <a href="/dieta.html" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>🍽️ Dieta</a>
      </div>

      {showInfo && <SystemInfo onClose={onCloseInfo} />}
    </div>
  )
}

const btnStyle = {
  background: 'rgba(255,255,255,0.08)', border: 'none', color: '#e2e8f0',
  borderRadius: 10, width: 38, height: 38, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

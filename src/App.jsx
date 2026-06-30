import { useState, useEffect } from 'react'
import { WORKOUTS } from './data'
import WorkoutView from './components/WorkoutView'
import SystemInfo from './components/SystemInfo'
import { saveCardio as saveCardioAPI, getCardio } from './api'

const CARDIO_TARGET = 180
const LS_KEY = 'leotreino-cardio'

function loadCardioLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}

function saveCardioLS(data) { localStorage.setItem(LS_KEY, JSON.stringify(data)) }

function getWeekMonday() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  return mon.toISOString().split('T')[0]
}

function strDate() { return new Date().toISOString().split('T')[0] }

function getTodayWorkoutKey() {
  try {
    const weekday = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date())

    const normalized = weekday
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const map = {
      terca: 'A',
      'terca-feira': 'A',
      quarta: 'B',
      'quarta-feira': 'B',
      quinta: 'C',
      'quinta-feira': 'C',
      sabado: 'D',
    }

    return map[normalized] || ''
  } catch {
    const day = new Date().getDay()
    const fallbackMap = {
      2: 'A',
      3: 'B',
      4: 'C',
      6: 'D',
    }
    return fallbackMap[day] || ''
  }
}

export default function App() {
  const [view, setView] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [cardioData, setCardioData] = useState({})
  const [cardioInput, setCardioInput] = useState('')
  const [editingCardio, setEditingCardio] = useState(false)
  const [cardioLoaded, setCardioLoaded] = useState(false)
  const todayWorkoutKey = getTodayWorkoutKey()

  useEffect(() => {
    async function load() {
      const weekMon = getWeekMonday()
      const today = strDate()
      const fromApi = await getCardio(weekMon, today)
      const data = {}
      if (fromApi && fromApi.length > 0) {
        fromApi.forEach(r => {
          const d = r.data instanceof Date ? r.data.toISOString().split('T')[0] : String(r.data).split('T')[0]
          data[d] = r.minutos
        })
      }
      // Fallback to localStorage for any dates not in API
      const ls = loadCardioLS()
      for (const [k, v] of Object.entries(ls)) {
        if (k >= weekMon && !(k in data)) {
          data[k] = v
        }
      }
      setCardioData(data)
      setCardioLoaded(true)
    }
    load()
  }, [])

  const weekMon = getWeekMonday()
  const todayKey = strDate()
  const todayMin = cardioData[todayKey] || 0
  const weeklyTotal = Object.entries(cardioData)
    .filter(([k]) => k >= weekMon)
    .reduce((sum, [, v]) => sum + v, 0)
  const pct = Math.round((weeklyTotal / CARDIO_TARGET) * 100)

  const addCardio = () => {
    const mins = parseInt(cardioInput) || 0
    if (mins <= 0) return
    const newTotal = (cardioData[todayKey] || 0) + mins
    const next = { ...cardioData, [todayKey]: newTotal }
    setCardioData(next)
    saveCardioLS(next)
    saveCardioAPI({ data: todayKey, minutos: newTotal }).catch(() => {})
    setCardioInput('')
  }

  const saveCardioEdit = () => {
    const mins = parseInt(cardioInput) || 0
    const next = { ...cardioData, [todayKey]: mins }
    setCardioData(next)
    saveCardioLS(next)
    saveCardioAPI({ data: todayKey, minutos: mins }).catch(() => {})
    setCardioInput('')
    setEditingCardio(false)
  }

  const startEditCardio = () => {
    setCardioInput(String(todayMin || ''))
    setEditingCardio(true)
  }

  if (view) {
    return (
      <WorkoutView
        workoutKey={view}
        onBack={() => setView(null)}
        onShowInfo={() => setShowInfo(true)}
        showInfo={showInfo}
        onCloseInfo={() => setShowInfo(false)}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0e1a, #0f172a)', padding: 20, paddingBottom: 100 }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: 30, marginBottom: 32, position: 'relative' }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 2 }}>
            Leo Treino
          </h1>
          <button onClick={() => window.location.reload()} title="Atualizar app" style={{
            position: 'absolute', top: 30, right: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, width: 32, height: 32, color: '#64748b', fontSize: 16,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>🔄</button>
        </div>

        {/* Workout cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {Object.entries(WORKOUTS).map(([key, w]) => (
            <button key={key} onClick={() => setView(key)} style={{
              background: key === todayWorkoutKey ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${key === todayWorkoutKey ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 16, padding: 22, cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative',
              overflow: 'hidden',
              boxShadow: key === todayWorkoutKey ? '0 0 20px rgba(249,115,22,0.08)' : 'none',
            }}>
              {key === todayWorkoutKey && (
                <>
                  <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 10, color: '#f97316', fontWeight: 700,
                    animation: 'pulse-ring 2s infinite', borderRadius: 8, padding: '2px 8px',
                    background: 'rgba(249,115,22,0.15)' }}>HOJE</span>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                    background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)', borderRadius: '50%' }} />
                </>
              )}
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#f97316', marginBottom: 6,
                letterSpacing: -1, position: 'relative', zIndex: 1 }}>{key}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, position: 'relative', zIndex: 1 }}>{w.subtitle}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 6, position: 'relative', zIndex: 1 }}>{w.day}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, position: 'relative', zIndex: 1 }}>{w.exercises.length} exercícios</div>
            </button>
          ))}
        </div>

        {/* Cardio counter */}
        <div style={{
          marginTop: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
          borderRadius: 16, padding: 18, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>🏃 Cardio Semanal</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: pct >= 80 ? '#4ade80' : '#f97316', fontFamily: "'JetBrains Mono', monospace" }}>
              {weeklyTotal}/{CARDIO_TARGET} min
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 100 ? '#4ade80' : '#f97316', borderRadius: 6, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editingCardio ? (
              <>
                <input
                  type="number" placeholder="min" value={cardioInput}
                  onChange={e => setCardioInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveCardioEdit()}
                  autoFocus
                  style={{
                    width: 60, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(249,115,22,0.4)',
                    borderRadius: 8, padding: '6px 10px', color: '#e2e8f0', fontSize: 14, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", outline: 'none', textAlign: 'center',
                  }}
                />
                <button onClick={saveCardioEdit} style={{
                  background: '#4ade80', color: '#0a0e1a', border: 'none', borderRadius: 8,
                  padding: '6px 10px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>✓ Salvar</button>
                <button onClick={() => { setEditingCardio(false); setCardioInput('') }} style={{
                  background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: 'none', borderRadius: 8,
                  padding: '6px 10px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>✕</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 11, color: '#64748b', minWidth: 50 }}>Hoje: {todayMin} min</span>
                <button onClick={startEditCardio} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, width: 24, height: 24, color: '#64748b', fontSize: 11,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }} title="Corrigir">✏️</button>
                <input
                  type="number" placeholder="min" value={cardioInput}
                  onChange={e => setCardioInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCardio()}
                  style={{
                    width: 60, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: '6px 10px', color: '#e2e8f0', fontSize: 14, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace", outline: 'none', textAlign: 'center',
                  }}
                />
                <button onClick={addCardio} style={{
                  background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>+ Adicionar</button>
              </>
            )}
            <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>110-130 bpm</span>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      }}>
        <NavItem label="Treino" emoji="🏋️" active />
        <NavItem label="Remédios" emoji="💊" href="/remedios.html" />
        <NavItem label="Dieta" emoji="🍽️" href="/dieta.html" />
        <NavItem label="Plano" emoji="📄" href="/plano-leonardo.html" />
        <button onClick={() => setShowInfo(true)} style={navBtnStyle}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Ajuda</span>
        </button>
      </div>

      {showInfo && <SystemInfo onClose={() => setShowInfo(false)} />}
    </div>
  )
}

function NavItem({ label, emoji, href, active }) {
  const btn = (
    <button style={navBtnStyle}>
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{ fontSize: 10, color: active ? '#f97316' : '#64748b', fontWeight: active ? 700 : 600 }}>{label}</span>
    </button>
  )
  if (href) return <a href={href} style={{ textDecoration: 'none' }}>{btn}</a>
  return btn
}

const navBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  padding: '4px 10px',
}

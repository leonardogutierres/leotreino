import { useState, useEffect, useRef } from 'react'

export default function RestTimer({ seconds, onClose, onDone }) {
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(seconds)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)
  const audioCtx = useRef(null)

  useEffect(() => setRemaining(seconds), [seconds])

  useEffect(() => {
    if (done) {
      try {
        if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)()
        const osc = audioCtx.current.createOscillator()
        const gain = audioCtx.current.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.current.destination)
        osc.frequency.value = 800
        gain.gain.value = 0.3
        osc.start()
        osc.stop(audioCtx.current.currentTime + 0.15)
        setTimeout(() => {
          osc.frequency.value = 1000
          const osc2 = audioCtx.current.createOscillator()
          const gain2 = audioCtx.current.createGain()
          osc2.connect(gain2)
          gain2.connect(audioCtx.current.destination)
          gain2.gain.value = 0.3
          osc2.start()
          osc2.stop(audioCtx.current.currentTime + 0.2)
        }, 200)
        setTimeout(() => {
          const osc3 = audioCtx.current.createOscillator()
          const gain3 = audioCtx.current.createGain()
          osc3.connect(gain3)
          gain3.connect(audioCtx.current.destination)
          osc3.frequency.value = 1200
          gain3.gain.value = 0.3
          osc3.start()
          osc3.stop(audioCtx.current.currentTime + 0.3)
        }, 400)
      } catch {}
    }
  }, [done])

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(p => {
          if (p <= 1) {
            setRunning(false)
            setDone(true)
            onDone?.()
            return 0
          }
          return p - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${minutes}:${String(secs).padStart(2, '0')}`

  const handleStart = () => {
    setDone(false)
    setRunning(true)
  }

  const handlePause = () => setRunning(false)

  const handleReset = () => {
    setRunning(false)
    setRemaining(seconds)
    setDone(false)
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)', borderRadius: 12, padding: '14px 16px',
      marginTop: 8, marginBottom: 4, textAlign: 'center',
      border: done ? '2px solid #22c55e' : '2px solid rgba(249,115,22,0.3)',
      transition: 'border 0.3s',
    }}>
      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        ⏱ Descanso
      </div>
      <div style={{
        fontSize: 42, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
        color: done ? '#4ade80' : running ? '#f97316' : '#64748b',
        letterSpacing: 2, transition: 'color 0.3s',
      }}>
        {done ? '✓' : display}
      </div>
      {!done && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          {!running ? (
            <button onClick={handleStart} style={timerBtn('#f97316')}>▶ Iniciar</button>
          ) : (
            <button onClick={handlePause} style={timerBtn('#eab308')}>⏸ Pausar</button>
          )}
          <button onClick={handleReset} style={timerBtn('#64748b')}>↺</button>
        </div>
      )}
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: '#64748b', fontSize: 11,
        cursor: 'pointer', marginTop: 8, fontWeight: 600,
      }}>Fechar timer</button>
    </div>
  )
}

const timerBtn = (color) => ({
  background: color, color: '#fff', border: 'none', borderRadius: 8,
  padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  fontFamily: "'JetBrains Mono', monospace",
})

import { COLORS } from '../data'

export default function SystemInfo({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f172a', borderRadius: 20, padding: 24,
        maxWidth: 420, width: '100%', maxHeight: '80vh', overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 20, textAlign: 'center' }}>
          Sistema de Séries
        </h2>

        {Object.entries(COLORS).map(([key, c]) => (
          <div key={key} style={{
            background: c.bg, borderLeft: `4px solid ${c.border}`,
            borderRadius: 10, padding: '12px 14px', marginBottom: 12,
          }}>
            <div style={{ fontWeight: 800, color: c.text, fontSize: 14, marginBottom: 6 }}>
              {c.emoji} {c.label} — {c.desc}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              {key === 'verde' && 'Série de aquecimento. Peso leve. Ativar músculo e articulação. Não gerar fadiga. Descanso: 60s. Opcional após o 1º exercício do mesmo grupo.'}
              {key === 'roxo' && 'Peso moderado. Alta qualidade técnica. Preparar para a série principal. Não chegar à falha. Serve para gerar tensão muscular. Pode haver mais de uma. Descanso: 60-90s.'}
              {key === 'laranja' && 'Série mais importante! Maior carga com técnica preservada. Trabalhar próximo da falha. Parar quando a execução começar a piorar. Falha total só na última série laranja. Descanso: 90-180s.'}
            </div>
          </div>
        ))}

        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px',
          marginBottom: 16, fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#e2e8f0' }}>Controle de carga:</strong><br />
          ↑ subir carga · ↓ reduzir carga · = manter carga
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px',
          marginBottom: 16, fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#e2e8f0' }}>Distribuição semanal:</strong><br />
          Seg: A · Ter: B · Qui: C · Sex/Sáb: D<br />
          Qua e Dom: recuperação ativa / mobilidade
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0',
          border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>Entendi ✓</button>
      </div>
    </div>
  )
}

const BASE = '/api'

async function fetchJSON(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function savePeso({ dia, exercicio_index, serie_index, peso, reps }) {
  return fetchJSON('/pesos', {
    method: 'POST',
    body: JSON.stringify({ dia, exercicio_index, serie_index, peso, reps }),
  })
}

export async function getPesos(dia) {
  return fetchJSON(`/pesos?dia=${encodeURIComponent(dia)}`)
}

export async function savePR({ dia, exercicio_index, peso }) {
  return fetchJSON('/pr', {
    method: 'POST',
    body: JSON.stringify({ dia, exercicio_index, peso }),
  })
}

export async function getPRs() {
  return fetchJSON('/pr')
}

export async function saveHistorico(data) {
  return fetchJSON('/treinos/historico', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getHistorico() {
  return fetchJSON('/treinos/historico')
}

export async function saveTimerConfig(duration_sec) {
  return fetchJSON('/timer', {
    method: 'POST',
    body: JSON.stringify({ duration_sec }),
  })
}

export async function getTimerConfig() {
  return fetchJSON('/timer')
}

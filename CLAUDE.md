# LeoTreino - Escala de Treinos

## Dias de Treino

| Dia | Treino | Foco |
|-----|--------|------|
| **Terça-feira** | Treino A | Quad / Glúteo / Panturrilha |
| **Quarta-feira** | Treino B | Peito / Ombro / Bíceps |
| **Quinta-feira** | Treino C | Costas / Ombro / Tríceps |
| **Sábado** | Treino D | Full Body + Panturrilha |

## Estrutura (por treino)

- **Treino A** (Terça): Abdutora, Agachamento pêndulo, Leg press, Extensora, Flexora, Panturrilha
- **Treino B** (Quarta): Prancha, Supino vertical, Crucifixo máquina, Desenvolvimento pronada, Elevação lateral cabo, Rosca martelo
- **Treino C** (Quinta): Prancha, Remada curvada pronada, Puxada aberta, Face pull, Elevação lateral, Tríceps polia, Francês unilateral
- **Treino D** (Sábado): Puxada supinada, Supino inclinado halter, Desenvolvimento barra, Rosca scott, Tríceps testa, Mesa flexora, Extensora, Panturrilha

## Cores das Séries

| Cor | Descrição | Descanso | Emoji |
|-----|-----------|----------|-------|
| Verde | Ativação/Aquecimento | 60s | 🟢 |
| Roxo | Trabalho Controlado | 90s | 🟣 |
| Laranja | Série Principal. Maior carga. Próximo da falha. | 120s | 🟠 |

Formato no `data.js`: `"+-1x10 ↑ +-1x10 ↑ 1x8-10 ↑ 1x6-8"` → verde, roxo, laranja, laranja (4 séries) ou `"1x15 ↑ 1x15 ↑ 1x18-22 ↑ 1x15-18 ↑ 1x8-12"` → 5 séries.

`+-` prefixo indica série opcional (verde a partir do 2º exercício do grupo).

## Arquivos

- `src/data.js` — Fonte de verdade: `WORKOUTS`, `COLORS`, `VIDEOS`, `parseSeries`, `findVideo`.
- `src/App.jsx` — Dashboard principal: grid de treinos, cardio tracker, nav.
- `src/components/WorkoutView.jsx` — Tela de treino, timer global, expandir/recolher.
- `src/components/ExerciseBlock.jsx` — Bloco de exercício, completa séries, persiste pesos (API + localStorage).
- `src/components/SeriesCard.jsx` — Card individual de série com inputs reps/peso.
- `src/components/RestTimer.jsx` — Timer de descanso baseado em `Date.now()` + `requestAnimationFrame` (funciona em segundo plano no celular). Auto-fecha 4s após concluir.
- `src/api.js` — Cliente HTTP para API Express (`/api/pesos`, `/api/pr`, `/api/timer`, `/api/treinos/historico`).
- `server.js` — Servidor Express: serve `dist/`, endpoints PostgreSQL, cria tabelas.
- `index.html` — Página de produção (sobrescrita pelo build). Servida pelo nginx.
- `index.html.bak` — Template Vite (`src="/src/main.jsx"`). Build restaura deste arquivo.
- `treinos.json` — Legado, não usado pelo React. Dados estão em `src/data.js`.

## Funcionalidades

- **Dashboard**: timer de sessão, stats (exercícios, séries, volume, progresso), cardio semanal.
- **Séries**: inputs de reps e peso, botão de completar. Peso preenchido do banco/localStorage.
- **Timer de descanso**: global, timestamp-based, sobrevive troca de app. Auto-fecha após 4s.
- **Pesos no banco**: PostgreSQL (`/api/pesos`) + localStorage fallback. PR automático.
- **Tema**: dark (fixo).

## Database (PostgreSQL via Express)

Tabelas (auto-criadas por `initDB()`):

- `pesos` — histórico diário: `dia, exercicio_index, serie_index, peso, reps, data`
- `pr_max` — recordes: `dia, exercicio_index, peso, data`
- `treino_historico` — sessões: `dia, data, duracao_min, volume_total, exercicios, series`
- `timer_config` — configuração: `user_id, duration_sec`
- `remedios_log` — remédios: `med_key, checked, date`

## Build & Deploy

```bash
npm run build    # restaura template → Vite build → copia dist/ para raiz
```

EasyPanel usa `nginx:alpine` servindo da raiz do projeto. Deploy manual:
```bash
docker ps --format '{{.Names}}' | grep leotreino | while read c; do
  docker cp index.html "$c:/usr/share/nginx/html/index.html"
  docker cp assets/ "$c:/usr/share/nginx/html/assets/"
done
```

## Arquitetura

- React + Vite → `dist/` → copiado para raiz (nginx serve direto)
- Timer usa `Date.now()` + `requestAnimationFrame` (não `setInterval`) — tempo real, funciona em background
- Timer único global em `WorkoutView`, `key` dinâmico força remontagem a cada nova série
- Pesos: tenta API primeiro (`getPesos`/`savePeso`), fallback localStorage (`leotreino-weights`)
- PR: verifica via `getPRs()` e salva com `savePR()` ao bater recorde
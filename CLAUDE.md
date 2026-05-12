# LeoTreino - Escala de Treinos

## Dias de Treino

| Dia | Treino | Foco |
|-----|--------|------|
| **Terça-feira** | Treino C | Quadríceps + Posterior + Panturrilha |
| **Quarta-feira** | Treino A | Peito + Tríceps + Abdominal |
| **Quinta-feira** | Treino B | Costas + Bíceps |
| **Sábado** | Treino D | Ombros + Abdominal |

## Estrutura

- **Treino A** (Quarta): Supino inclinado, Crucifixo inclinado, Supino reto, Crossover, Tríceps testa/corda/coice, Abdominal infra/remador
- **Treino B** (Quinta): Puxada aberta/fechada, Remada curvada, Serrote, Rosca direta/alternada/scott
- **Treino C** (Terça): Mobilidade quadril, Extensor, Agachamento livre, Leg 45, Stiff, Flexor, Panturrilha
- **Treino D** (Sábado): Desenvolvimento ombros, Elevação frontal/lateral, Crucifixo inverso, Encolhimento, Abdominal infra/remador/prancha

## Arquivos

- `treinos.json` — Base de dados com todos os exercícios, séries, repetições e vídeos (dados também embutidos em `index.html` como `TREINOS_DATA`)
- `index.html` — Página principal da aplicação (PWA, single-file)
- `dieta.html` — Plano alimentar
- `remedios.html` — Controle de medicamentos

## Funcionalidades do index.html

- **Dashboard**: timer de sessão + stats (exercícios, séries, volume, progresso %)
- **Tabs por dia**: auto-navega para o dia atual; swipe para trocar de aba
- **Séries**: checkbox por série, campo de peso (salvo em localStorage), campo de reps editável
- **Timer de descanso**: floating fixo na base da tela (não empurra conteúdo); configurável; persiste entre sessões
- **PR de carga**: toast ao bater recorde de peso num exercício (`pr-max-${dayId}-${exIndex}` no localStorage)
- **Histórico**: botão 📊 no header; salva data, dia, duração e volume ao concluir treino (localStorage `historico`, últimos 50)
- **Tema**: dark/light, persiste em localStorage
- **PWA**: service worker, manifest, ícones Apple

## Decisões de arquitetura

- `TREINOS_DATA` embutido diretamente no HTML — evita problemas de encoding e fetch em PWA offline
- Chaves do `TREINOS_DATA`: `TERÇA-FEIRA`, `QUARTA-FEIRA`, `QUINTA-FEIRA`, `SABADO` (sem acento) — manter consistente com array `diasSemana`
- Timer de descanso usa elemento `#floating-timer` global fixo; IDs `timer-${dayId}-${exIndex}-${serieIndex}` são lógicos apenas (não DOM)
- `finalizarTreino` salva histórico e celebra — reset manual via botão 🔄

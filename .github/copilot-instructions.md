# Copilot Instructions — socialtest

## Project Overview
5th grade multi-subject quiz app (Social Studies, Science, Health) with a **Capybara Quest** roguelike game mode. Single-page HTML app deployed to Azure Static Web Apps.

- **Live site:** https://happy-bay-052c8580f.4.azurestaticapps.net
- **Repo:** https://github.com/jrbanach/socialtest
- **Primary user:** Parker (5th grader) on iPhone 12 Safari

## Architecture

### Single HTML File
Everything lives in `index.html` — HTML structure, CSS, and all JavaScript. **No build step, no bundler, no framework.** Keep it this way.

### Canvas Rendering
All game graphics use the **Canvas 2D API** with procedural drawing (no external images). Character draw functions follow the pattern `drawEnemy(ctx, x, y, enemyId, pose)` where pose is `idle|attack|hurt|defeat`. Battle animations use `requestAnimationFrame` loops with a `battleAnimating` flag to prevent overlap.

### Quest State Machine
The game quiz uses a multi-stage quest engine with 8 phases:
`STAGE_INTRO → QUESTIONS → STAGE_CLEAR → EVENT → DRAFT → next STAGE_INTRO → ... → VICTORY/DEFEAT`

Key objects:
- `questState` — full quest state (phase, stages, hero stats, equipment, XP)
- `getCurrentStage()` / `getCurrentEnemy()` — access current stage/enemy
- `advanceQuestPhase()` — transitions between phases
- `renderGameQuiz()` — phase router that dispatches to the correct renderer

### Azure Backend
- `api/` contains Azure Functions (Node.js) for questions, history, and player profiles
- Uses `@azure/storage-blob` for persistence
- **Keep Azure costs low** — blob storage + simple functions only, no web apps
- Frontend falls back to `localStorage` when API is unreachable (CORS on localhost)

### Data
- `QUIZ_REGISTRY` — 5 quizzes: Colonial America (Ch 5–6), Minerals, Rocks & Rock Cycle, Health Ch7, Weather & Atmosphere
- Each quiz defines its own `vocab`, `mc`, `jeopardy`, and optional `matching`/`rockcycle` sections
- `ENEMY_ROSTER` (5 enemies) — wolf → skeleton → wizard → dark knight → dragon boss
- `POWERUP_POOL` (7 items) — equipment with stat effects
- `EVENT_POOL` (4 events) — random encounters between stages

## Key Conventions

### Mobile-First
- **Primary target: Safari on iPhone 12** (390×844)
- During active battle, the app title/nav/subtitle hide on mobile (`body.battle-active` class)
- Battle canvas is 64px on mobile, 140px on desktop
- All buttons must be ≥44px touch targets
- Test with DevTools device mode (F12 → Ctrl+Shift+M → iPhone 12 Pro)

### Game Mechanics
- Enemy is "Defeated" if player scores ≥50% on that stage, "Escaped" if <50%
- HP=0 → immediate Quest Over (no Keep Going)
- Dragon boss has 20% fire breath chance on correct answers
- Gold/Silver/Bronze medals based on enemies defeated count
- Titles awarded on victory: Dragon Slayer, Perfect Scholar, Seasoned Warrior, Untouchable
- Equipment effects: `blockFirst`, `dodgeChance`, `passiveHeal`, `xpBonus`, `firstHitDouble`

### Testing
- Tests live in `tests.html` — a self-contained test runner with no dependencies
- Currently 183 tests covering quiz data, scoring, battle state, quest engine, equipment, XP, boss mechanics, titles, matching, and multi-quiz support
- Tests use mirrored pure functions (not DOM-dependent) for isolated testing
- Run by opening `tests.html` in a browser

### Branching Strategy
- `develop` branch for integration
- Feature branches (`feature/xxx`) → PR into `develop`
- `develop` → `master` to deploy (Azure SWA auto-deploys from master)
- **Note:** The `jimbanach` work account cannot push to this repo without a PAT from the `jrbanach` personal account

### Style
- No external CSS or JS libraries
- Inline styles for one-off elements, CSS classes for reusable patterns
- Emoji used extensively for visual feedback (kid-friendly)
- Comic Sans for impact text in battle animations (intentional)
- All colors use hex or rgba, gradients for polish

## Files
| File | Purpose |
|------|---------|
| `index.html` | Entire app (~6,600 lines) |
| `tests.html` | Unit test suite (183 tests) |
| `staticwebapp.config.json` | Azure SWA config + CSP headers |
| `api/` | Azure Functions backend (questions, history, players) |
| `docs/capybara-quest-plan.md` | Capybara Quest implementation plan + session log |
| `WORKLOG.md` | Project history and architecture notes |
| `animation-preview.html` | Dev tool — preview all enemy animations (not production) |
| `studyguides/` | Source study materials organized by subject (health, science) |

## Future Enhancements
- Per-quiz score tracking and cross-quiz achievements
- Additional subjects and chapters as Parker's curriculum evolves

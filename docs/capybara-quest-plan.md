# Plan: Enhanced Capybara Battle — Multi-Stage Roguelike (Issue #10)

## Session Status (saved 2026-03-03)

### What's Done
- ✅ **#11 Stage Data Model** (PR #23 → merged to master) — ENEMY_ROSTER, POWERUP_POOL, EVENT_POOL, buildQuestStages(), QUIZ_REGISTRY with subject metadata, DEFAULT_HERO_STATS. 11 unit tests.
- ✅ **#12 Refactor Game State** (PR #24 → merged to master) — questState object with 8-phase state machine, hero XP/leveling, equipment system with stacking bug fix, random events, save/load backward compatible. 10 unit tests.
- ✅ **Branching strategy** — Created `develop` branch. Future feature PRs → develop → test locally → PR to master (deploys to Azure).

### What's In Progress
- 🔄 **#13 Enemy Canvas Art** (PR #26 → targets develop) — On branch `feature/enemy-roster`. All 5 enemies + upgraded hero drawn. Sub-agent just fixed sizing (wolf/skeleton too small, dragon not imposing enough) and added missing drawXEyes. **NEXT: Review the updated character-preview.html to approve art, then merge PR #26.**

### What's Next (in order)
1. Review updated character art in `character-preview.html` (just rebuilt with fixes)
2. Merge PR #26 into develop
3. **#14 Stage Transitions** — wire up the stage flow UI (adventure map, stage-clear screens)
4. Then parallel: #15 Equipment UI, #18 Hero Progression, #17 Battle Animations

### Key Decisions Made
- **Quiz-agnostic engine**: QUIZ_REGISTRY wraps quiz data with id/subject/title/grade. `activeQuiz` variable swaps subjects.
- **Mobile-first**: Primary target is Safari on iPhone 12
- **Develop branch**: Feature branches → PR into develop → test → PR into master (auto-deploys)
- **Procedural Canvas art for now**: Shipping with Canvas-drawn characters. Sprite image upgrade tracked as Issue #27 (post-plan).
- **No mid-quiz reset button**: Pre-existing bug tracked as Issue #25 (post-plan). Workaround: `localStorage.removeItem('socialtest_progress')` in browser console.
- **Azure cost control**: Blob storage + simple functions only, no web apps

### GitHub Issues
- #10 Parent epic (Capybara Quest)
- #11-#22 Child issues by phase (Phase 1: #11-14, Phase 2: #15-18, Phase 3: #19-22)
- #25 Mid-quiz reset button (bug, post-plan)
- #26 PR: Enemy Canvas art (open, targets develop)
- #27 Sprite art upgrade (enhancement, post-plan)

### Project Location
- Code: `C:\Users\jrban\githubprojects\socialtest` (moved from C:\projects during this session)
- CopilotWorkspace: `C:\Users\jrban\CopilotWorkspace\socialtest` (project.json + copilot-instructions.md)
- Repo: https://github.com/jrbanach/socialtest
- Live: https://happy-bay-052c8580f.4.azurestaticapps.net
- Active branch: `feature/enemy-roster`
- Temp files on branch (not committed): `character-preview.html`, `character-preview.png`

---

## Problem
Parker wants the Capybara Battle game mode to feel more like **Capybara Go!** — a roguelike RPG with multiple battles, progression, and replayability. Currently, the game mode is a single flat encounter (capybara knight vs dragon) where correct/wrong answers map to attacks.

## Proposed Approach
Transform the single-battle game quiz into a **multi-stage adventure run** with roguelike elements, while keeping the quiz questions as the core mechanic and staying within the single-HTML-file architecture. You can use the azure storage blob or simple azure functions as needed, but we still need to keep the run cost low (no azure webapps for example)

### Core Design: "Capybara Quest" Mode
Each quiz run becomes an **adventure** with 3-5 stages, each featuring a different enemy. Between stages, the player picks power-ups. The hero (Sir Capybara) carries stats across stages.

---

## Architecture Overview

### Stage System
- Questions divided into **waves** (stages) of ~7-10 questions each
- Each stage has a unique enemy drawn on Canvas (goblin, skeleton, wolf, dark knight, dragon boss)
- Stage transitions show a "map" screen with the path ahead
- Final stage is always the **dragon boss** (harder questions or timed)

### Hero Progression (Within a Run)
- **XP & Level**: Earn XP per correct answer → level up between stages (attack + HP boost)
- **Equipment slots**: Weapon, Armor, Accessory (3 slots)
- Between stages, choose 1 of 3 random power-ups/equipment (roguelike draft mechanic)
- Stats: Attack (damage per correct answer), Defense (chance to block wrong-answer damage), MaxHP

### Power-Up / Equipment Examples
| Item | Effect |
|------|--------|
| 🗡️ Sharp Sword | +1 attack damage |
| 🛡️ Iron Shield | Block first wrong answer each stage (no HP loss) |
| 💚 Healing Potion | Restore 2 hearts |
| ⚡ Speed Boots | Bonus XP from correct answers |
| 🔥 Fire Amulet | Double damage on first hit each stage |
| 🍀 Lucky Clover | 25% chance wrong answer doesn't count |
| 🐾 Pet Companion | Passive heal: restore 1 half-heart every 5 questions |

### Enemy Roster (Canvas-drawn)
1. **🐺 Wolf Pack** (Stage 1) — easy warm-up, low HP
2. **💀 Skeleton Warrior** (Stage 2) — medium difficulty
3. **🧙 Dark Wizard** (Stage 3) — can "curse" (steal a power-up if you get 2 wrong in a row)
4. **⚔️ Dark Knight** (Stage 4) — high HP, needs multiple hits
5. **🐉 Dragon Boss** (Final) — most HP, special attack animations

### Random Events (Between Stages)
After clearing a stage, before the power-up draft, show a random event:
- 🏕️ "Rest at Camp" — restore 1 heart
- 🎪 "Traveling Merchant" — trade a power-up for a different one
- ⚠️ "Ambush!" — mini-battle with 2 bonus questions (reward: extra XP)
- 🗺️ "Shortcut Found" — skip to next stage but no power-up draft

### Persistent Unlocks (Across Sessions)
- **High score tracking** (already exists) — track furthest stage reached
- **Title system**: "Dragon Slayer" (beat the boss), "Perfect Scholar" (no wrong answers in a run), etc.
- Saved to Azure Blob via existing player profile system

---

## Todos

1. **Design stage data model** — Define stage structure (enemy, question indices, HP, special abilities) and how questions are distributed across stages
2. **Refactor game state** — Extract current single-battle state into a stage-aware state machine (currentStage, stageEnemy, heroStats, equipment, xp)
3. **Build enemy roster** — Canvas drawing functions for 5 enemy types (wolf, skeleton, wizard, dark knight, dragon) with idle/attack/hurt/defeat poses. The enemies and the capybara hero all should look more like capaybara go than the bad mspaint style they do now. 
4. **Implement stage transitions** — Stage-clear screen, adventure map/path visualization, "next stage" flow
5. **Build power-up/equipment system** — Equipment data model, draft UI (pick 1 of 3), stat modifiers, equipment display on hero stats bar
6. **Build random events** — Event pool, random selection between stages, event UI with choice buttons, effects applied to hero state
7. **Enhance battle animations** — Per-enemy attack animations (wolf bite, skeleton slash, wizard curse, dark knight charge, dragon fireball), hero attack scales with attack stat
8. **Update hero progression** — XP gain per correct answer, level-up between stages with stat boosts, display level/XP bar
9. **Add boss mechanics** — Dragon boss has special abilities (e.g., fire breath hits even on correct answer 20% of the time), more HP, victory celebration
10. **Update persistence** — Save/restore run-in-progress to localStorage, persist titles/achievements to Azure, update history tracking
11. **Write tests** — Unit tests for stage progression, equipment effects, XP/leveling, random events, boss mechanics
12. **Mobile UX polish** — Ensure stage transitions, power-up drafts, and map screen all work well on phone screens

## Execution Strategy — Parallelization

We'll use sub-agents (parallel task runners) to speed up independent workstreams. Here's the phased execution with parallelism mapped out:

### Phase 1 — Sequential Start, Then Fork
```
Step 1:  #11 Stage Data Model (sequential — everything depends on this)
Step 2:  #12 Refactor Game State  ║  #13 Enemy Roster (Canvas art)
           (code logic)           ║     (visual/creative — independent)
Step 3:  #14 Stage Transitions    ║  #13 continues if not done
```
- **Gate 1**: After Phase 1, full review. Verify stage flow works end-to-end, enemies render, no regressions on existing tests.

### Phase 2 — Maximum Parallelism
```
Step 4:  #15 Equipment System  ║  #18 Hero Progression  ║  #17 Battle Animations
Step 5:  #16 Random Events (needs #14)                   ║  #17 continues
```
- **Gate 2**: After Phase 2, full review. Equipment effects work, XP/leveling balanced, animations smooth on iPhone 12.

### Phase 3 — Integration & Polish
```
Step 6:  #19 Boss Mechanics  ║  #20 Persistence
Step 7:  #21 Tests (needs #14, #15, #18 done)  ║  #22 Mobile UX Polish
```
- **Gate 3**: Final review. All systems integrated, tests pass, mobile UX approved.

### Sub-Agent Usage
- **General-purpose agents** for parallel code changes on independent branches
- **Explore agents** for codebase questions during implementation
- **Task agents** for running tests and builds at each gate
- Each parallel workstream operates on its own feature branch to avoid conflicts

## Considerations
- **Scope control**: This is a big feature. Could ship in phases: Phase 1 (stages + enemies), Phase 2 (equipment + events), Phase 3 (boss mechanics + achievements)
- **Question distribution**: With 37 jeopardy questions spread across 5 stages, that's ~7 per stage. May need to adjust stage count based on quiz mode (vocab only = fewer stages)
- **Keep it fun for a 5th grader**: Don't overcomplicate stats. Visual feedback > numbers. Big animations, funny defeat messages, celebratory victories
- **Canvas performance**: All 5 enemies need to be drawn efficiently. Reuse the existing drawing pattern (function-based pixel art on canvas)
- **Backward compatibility**: The existing 4 quiz modes (Random, Full Study, Vocab Only, Defs Only) should still work — they just now trigger a multi-stage adventure instead of a single fight
- **Mobile first design**: most times it will be played on mobile.  Plan for it to be played in safari on an iphone 12 first and foremost. 
- **have a number of gates for confirmation**: as this is a big change like you said, i want to make sure we don't break anything while building. 
- **we should be able to add in other quizes later**:  we're building a strong study structure now and i'd hate to have to recreate this every time there is a new subject we need to study for. 

---

## Future Enhancements (Post-Plan)
Ideas to tackle after the current Capybara Quest plan is complete:

1. **Subject name in UI header** — Display `activeQuiz.subject` and `activeQuiz.title` in the app header so players know which quiz they're studying
2. **Per-quiz score tracking** — Tag history/scores with `activeQuiz.id` so each subject has its own leaderboard and progress tracking
3. **Quiz picker on home screen** — When multiple quizzes exist in `QUIZ_REGISTRY`, show a selection screen to choose which subject to study
4. **Quiz content management** — Allow adding new quizzes via Parent Mode or a separate admin flow
5. **Cross-quiz achievements** — Titles that span subjects (e.g., "Multi-Subject Master" for beating boss on 3 different quizzes)

6. **Upgrade character art from procedural Canvas to sprite images** — Current characters are drawn procedurally with Canvas shapes (arcs, gradients, fills). While functional and recognizable, they don't match the polished cartoon look of Capybara Go. Options explored:
   - **Sprite PNGs on Canvas (recommended)**: Create cartoon character PNGs (AI-generated or hand-drawn), store as static files alongside index.html. Azure Static Web Apps serves them free. Swap `drawWolf(ctx,x,y)` calls with `drawImage()`. Sprite sheets with 4 poses per character = 6 small files. Zero architecture change.
   - **SVG inline**: Scalable vector art embedded in HTML. More detailed than Canvas shapes, animatable with CSS/JS. No external files needed but still limited vs actual illustrations.
   - **Base64 inline images**: Same as sprite PNGs but encoded directly in HTML. Keeps single-file architecture but bloats file size significantly.
   - Key question answered: None of these require anything more complex than a static web app. The rendering engine (Canvas) stays the same — only the art source changes from procedural drawing to pre-made images.

# Social Studies Quiz — Work & Decision Log

## Pending release — Grade 6 Metric & Density + Formula Hint

- Added Jim-reviewed Earth Science: Metric System & Density content: 5 vocabulary definitions, 15 matching items, 27 concept MC questions and 12 calculation MC questions. Sources are the supplied single-page metric and density notes; Jim authorized new numerical practice values. C28 was removed in his review.
- This quiz enables only vocabulary, matching and multiple choice. Existing quizzes and their Capybara Quest content remain unchanged.
- Added question-specific **Formula Hint** buttons for relevant questions. They open a centered native dialog with a title, centered formula, variable legend and **Back to Quiz** button. No numerical substitutions or worked answers are shown.
- Hint access is optional and does not change the selected answer, choice order, score or saved progress. Back to Quiz and Escape return to the question; changing questions/screens closes stale hints. Formula content uses textContent; prompts/instructions remain escaped. No new production dependencies.
- Calculations permit a calculator and instruct Parker to show work on paper, truncate to the thousandth without rounding, and circle the final answer. The app grades only the selected choice.
- Added `tests/metric-density-browser.mjs`, a Node 22+ / installed-Chromium integration test with no npm dependencies. It serves localhost-only test content and rejects all API calls locally; no production storage is contacted.
- Verification: existing tests.html 256/256; 64 real-browser integration checks and 10 backend persistence tests passed. Coverage includes all 18 question-to-hint mappings, state preservation, old quiz/history preservation, keyboard behavior, a 390×844 mobile layout, HTTP save failure, reload recovery, and vocabulary/matching/MC cloud-save flows. Actual iPhone Safari testing remains pending.
- Completed results now use durable local pending records and stable attempt IDs. Only an HTTP success with a matching acknowledgement marks a record synced. Failures show a warning and retry on a timer, reconnect, visibility change, and reload. Older unconfirmed browser history is recovered without duplicating its existing cloud record. Unfinished answers remain browser-local, as requested.
- History append operations use Blob ETag conditions and bounded conflict retries to prevent concurrent writers from losing results. Uploads use UTF-8 byte lengths, including formula symbols. Implementation references: https://learn.microsoft.com/azure/storage/blobs/concurrency-manage and https://learn.microsoft.com/javascript/api/@azure/storage-blob/blockblobclient .
- Backend test command: `node --test tests/history-persistence.test.cjs`. Tests use explicit in-memory Azure SDK fixtures and exercise the actual handlers/helper; they are not a claim of production storage verification.
- Run: `CHROME_BIN=/path/to/chromium node tests/metric-density-browser.mjs`. Optional `SCREENSHOT_PATH` captures the mobile modal. On this VM, `/snap/bin/chromium` works with its sandbox; the cached Chrome-for-Testing binary cannot initialize its sandbox. No sandbox settings were changed.
- Pre-deployment snapshot: captured all 22 read-only API responses (registered quiz questions/history, legacy questions/history, settings, players) in a private local JSON backup. Direct Blob credentials and access permissions were not changed.
- Deployment plan approved by Jim: after verifying deployment, persist the new quiz and missing bundled-only older quiz content through the existing API; set visible and active quiz to `earth-science-metric-density`, preserving other settings and all old results. Verify persistence by independent fresh GETs. Use an isolated verification quiz for save smoke tests so Parker’s actual scores remain clean.

## Project Overview
A mobile-friendly study quiz for 5th grade social studies (Chapters 5 & 6 — Colonial America). Built as a standalone HTML file deployed to Azure Static Web Apps with Azure Blob Storage backend for cross-device persistence.

## Key Decisions

### Architecture
- **Single HTML file** — no server, no build step, no dependencies. All HTML/CSS/JS inline in `index.html`.
- **Azure Blob Storage** for cross-device persistence — quiz data, player profiles, and attempt history stored in cloud.
- **Azure Functions** (Node.js 20, Consumption plan) as API proxy — keeps storage credentials server-side.
- **localStorage as write-through cache** — instant local writes, async API sync. Works offline.
- **Standalone deployment** — Azure Static Web App (free tier), auto-deploys on push to `main`.

### Content Source
- Study material from `socialtest.pdf` (scanned, 2 pages).
- PDF was OCR'd using Docker + Tesseract → converted to `socialtest.docx` for review.
- User reviewed and edited the Word doc before content was used.

### Quiz Design
- **Section 1 — Vocabulary (20 terms):** Fill-in-the-blank with clickable word bank. Definitions written at 5th grade reading level based on colonial America curriculum.
- **Section 2 — Multiple Choice (17 questions):** 4 choices each — 1 correct, 2 plausible, 1 obviously wrong (kid-friendly humor).
- **Scoring:** Shows results with encouragement messages. Retry mode shows only missed questions.
- **Parent Mode:** Password-protected (`dad`). Two tabs: Answer Key and Edit Questions (edit any term, definition, question, or answer choice — saved to localStorage).

### Terms Included
Charter, Indentured Servant, Roanoke Island, Almanac, Pilgrim, Persecution, Debtor, Apprentice, Artisan, Squanto, Cash Crop, John Smith, Mayflower Compact, William Penn, Puritans, Francis Drake, Proprietor, Town Common, James Oglethorpe, Elizabeth Lucas Pinckney

### Deployment
- **GitHub repo:** `jrbanach/socialtest`
- **Azure Static Web App:** Free tier, linked to GitHub repo, auto-deploys on push to `main`
- **CI/CD:** GitHub Actions workflow generated by Azure SWA

### Tools Used
- Docker (python:3.12-slim) for PDF OCR (Tesseract + pdfplumber)
- GitHub CLI (`gh`) for repo creation
- Azure CLI (`az`) for Static Web App creation
- Copilot CLI for code generation

## How to Update
1. Edit `index.html` locally or via Parent Mode in the browser
2. If editing the file directly: push to `main` and Azure auto-deploys
3. If editing via Parent Mode: changes are saved in localStorage (browser-only, won't affect the deployed default)
4. To change default questions permanently: edit the `DEFAULT_VOCAB`, `DEFAULT_MC`, and `DEFAULT_JEOPARDY` arrays in `index.html`

## Game Quiz Feature (Jeopardy-Style with Battle Gamification)

### What It Is
A third quiz section called "Game Quiz" that flips the format Jeopardy-style:
- **Clue shown** = the definition or answer
- **Choices** = terms or question paraphrases (1 correct, 2 close, 1 very wrong)
- Includes an animated battle between a **capybara knight hero** and a **dragon villain**

### Question Pool
- **20 vocab-based**: Vocabulary definitions shown as clues → pick the correct term
- **17 MC-based**: Correct MC answers shown as clues → pick the matching question (shortened paraphrases)
- **37 total questions** stored in `DEFAULT_JEOPARDY` array

### Quiz Modes (Settings Dialog)
Students choose before starting:
1. 🎲 **Random Mix** — all 37 shuffled, category labels shown
2. 📚 **Full Study** — vocab first (20), then definitions (17)
3. 📖 **Vocabulary Only** — just the 20 vocab questions
4. ✏️ **Definitions Only** — just the 17 definition questions

### Battle Gamification
- Canvas-drawn characters: capybara knight (left) vs dragon (right) on a sky/grass field
- **Correct answer** → hero charges all the way to dragon, sword swing, comic "POW!" starburst on impact (~1.3s animation)
- **Wrong answer** → dragon advances ~35%, shoots Bowser-style fireballs that travel to hero, comic "POW!" on impact (~1.7s animation)
- **Zelda-style hearts** (5 hearts, half-heart granularity) — hero HP scales to 30% threshold
- **Hero defeated** when >30% wrong → slumped pose with cartoon X-eyes, option to restart or continue
- **Victory animation** (~1.8s) — dragon falls over with X-eyes, hero does a bounce-and-sway dance with sparkle stars
- Battle fully resets on retry
- All animations tuned for readability at kid-friendly pace

### Parent Mode
- **Answer Key** tab now includes Game Quiz answers (vocab + definition sub-sections)
- **Edit Game Quiz** tab allows editing all 37 clues, choices, and correct answers
- Sub-sections for vocab-based and definition-based questions
- Reset All to Defaults clears Game Quiz data alongside vocab and MC

### Architecture Decisions
- Single HTML file maintained — all CSS, HTML, JS inline in `index.html`
- Canvas API for character drawing and battle animations (no external images, CSP-compliant)
- SVG hearts rendered inline for Zelda-style HP display
- localStorage persists Game Quiz progress (mode, answers, HP, battle state)
- All user-facing strings sanitized with `esc()` for XSS prevention

### Testing
- `tests.html` — 63 unit tests run in-browser (no dependencies)
  - **Quiz Logic Suite**: data integrity (37 questions, 4 choices each, valid indices), shuffle correctness, mode filtering (vocab/defs/all/random), scoring, XSS sanitization
  - **Battle Logic Suite**: HP calculations (30% threshold), heart rendering (full/half/empty), defeat conditions, battle reset, damage mechanics
  - **Restart Suite**: section isolation, mid-quiz restart, HP recalculation, confirm dialog mapping
  - **Persistence & Player Suite**: localStorage read/write, edit-save-refresh cycle, saveInFlight guard, player CRUD, history records, retry-logging logic
- Open `tests.html` in a browser to see green/red results
- Tests are development-only (not deployed to Azure)

## Azure Backend (Issue #6)

### Infrastructure
- **Resource Group:** `socialtest-rg` (eastus2)
- **Storage Account:** `socialtestdata` — Blob container `quiz-data` (private access)
- **Blobs:** `questions.json`, `history.json`, `players.json`
- **Function App:** `socialtest-api` (Consumption plan, Node.js 20, Linux)
- **CORS:** Configured for `https://happy-bay-052c8580f.4.azurestaticapps.net`, `http://localhost`, `http://127.0.0.1`, `null` (file://)

### API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/questions` | Read quiz questions from blob |
| PUT | `/api/questions` | Save updated questions to blob |
| GET | `/api/history` | Read all attempt history |
| POST | `/api/history` | Append a new attempt record |
| GET | `/api/players` | Read player registry |
| POST | `/api/players` | Register a new player |

### Player Identity System
- On first visit, user chooses "New" or "Returning" player
- New players enter name → POST to API → UUID assigned
- Returning players enter name → fuzzy match against registry
- Player ID/name stored in localStorage for subsequent visits
- "Not you?" button to switch players

### History & High Scores
- Every quiz completion (not retries) logs an attempt record
- Record includes: playerId, playerName, section, mode, score, total, percentage, timestamp
- Parent mode has "📊 History" tab showing high scores per section + recent attempts
- Home screen shows high scores summary

### Cache & Race Condition Handling
Lessons applied from `kids-schedule` project (commit `ca4f447`):
1. `{ cache: 'no-store' }` on all fetch calls — prevents browser caching stale blob data
2. `saveInFlight` guard — blocks background refresh during save to prevent stale overwrites
3. localStorage as write-through cache — write locally first (instant), then sync to API
4. Save toast shows "✅ Saved" or "⚠ Saved locally" in parent mode only

### Security
- Storage connection string in Azure Function app settings only (never in client code)
- All blob access proxied through Azure Functions (no SAS tokens in HTML)
- CSP updated: `connect-src 'self' https://socialtest-api.azurewebsites.net`
- No authentication on endpoints (family use, low risk)

## File Structure
```
socialtest/
├── index.html              # The entire quiz app (vocab, MC, Game Quiz, player system)
├── tests.html              # Unit tests (63 tests, open in browser to run)
├── README.md               # Project overview and setup instructions
├── WORKLOG.md              # This file — detailed work & decision log
├── staticwebapp.config.json # Security headers (CSP, X-Frame-Options)
├── api/                    # Azure Functions backend
│   ├── host.json           # Functions v2 host config
│   ├── package.json        # Node.js dependencies (@azure/storage-blob)
│   ├── local.settings.json # Local dev settings (empty connection string)
│   └── src/
│       ├── blobHelper.js   # Shared blob read/write helper
│       └── functions/
│           ├── questions.js # GET/PUT /api/questions
│           ├── history.js  # GET/POST /api/history
│           └── players.js  # GET/POST /api/players
└── .github/
    └── workflows/          # Azure SWA deploy workflow (auto-generated)
```

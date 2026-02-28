# 5th Grade Social Studies Quiz

A mobile-friendly study quiz for 5th grade social studies — Colonial America, Chapters 5 & 6. Features cross-device persistence via Azure Blob Storage and player identity/history tracking.

**Live:** [https://happy-bay-052c8580f.4.azurestaticapps.net](https://happy-bay-052c8580f.4.azurestaticapps.net)

## Features

### 📝 Vocabulary Quiz (20 terms)
Fill-in-the-blank with a clickable word bank covering colonial America terms (Charter, Indentured Servant, Roanoke Island, Pilgrim, etc.).

### ✅ Multiple Choice Quiz (17 questions)
Four choices each — one correct, two plausible, one humorously wrong. One question at a time with immediate feedback.

### 🎮 Capybara Battle — Game Quiz (37 questions)
Jeopardy-style flipped questions with animated canvas battle:
- **Clue shown** = the definition or answer → pick the correct term
- **Capybara knight hero** vs **dragon villain** drawn on HTML5 Canvas
- Correct answer → hero charges and attacks with comic "POW!" starburst
- Wrong answer → dragon shoots Bowser-style fireballs
- Zelda-style hearts (5 hearts, half-heart granularity)
- Victory dance with sparkle stars, defeat with cartoon X-eyes
- 4 quiz modes: Random Mix, Full Study, Vocab Only, Definitions Only

### 👤 Player Identity
- New/returning player detection on first visit
- Player profiles stored in Azure Blob Storage
- High scores shown on home screen
- "Not you?" to switch players

### 🔒 Parent Mode
Password-protected area to:
- View answer keys for all three quiz sections
- Edit any question, answer, term, or definition
- View 📊 History — high scores and recent attempts by all players
- Reset all customizations back to defaults
- Save indicator shows sync status (✅ Saved / ⚠ Saved locally)

## Tech Stack

- **Single HTML file** — no build step, no dependencies, no server-side rendering
- **Azure Blob Storage** for cross-device persistence (questions, history, players)
- **Azure Functions** (Node.js 20) as API proxy — keeps storage credentials server-side
- **localStorage as write-through cache** — instant offline support, async cloud sync
- **Canvas API** for all battle characters and animations (no external images)
- **Azure Static Web Apps** (free tier) with auto-deploy from GitHub

## Running Locally

Open `index.html` in any modern browser. Works offline with localStorage fallback.

## Testing

Open `tests.html` in a browser — 63 unit tests covering quiz logic, battle mechanics, persistence, and player system run automatically.

## Deployment

Push to `master` → GitHub Actions auto-deploys to Azure Static Web Apps.

## File Structure

```
socialtest/
├── index.html                # The entire quiz app
├── tests.html                # 63 unit tests (browser-based)
├── README.md                 # This file
├── WORKLOG.md                # Detailed work log & decision history
├── staticwebapp.config.json  # Security headers (CSP, X-Frame-Options)
├── api/                      # Azure Functions backend
│   ├── host.json             # Functions v2 host config
│   ├── package.json          # Node.js dependencies
│   └── src/
│       ├── blobHelper.js     # Shared blob read/write helper
│       └── functions/        # GET/PUT questions, GET/POST history, GET/POST players
└── .github/
    └── workflows/            # Azure SWA deploy workflow
```

## Security

- Storage connection string in Azure Function app settings only (never in client code)
- All blob access proxied through Azure Functions (no SAS tokens exposed)
- Parent mode password hashed with SHA-256 (never stored in plaintext)
- All user input sanitized with HTML entity escaping (`esc()`)
- Content Security Policy headers block external scripts and allow only the API domain
- No external dependencies or CDN loads

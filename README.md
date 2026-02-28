# 5th Grade Social Studies Quiz

A mobile-friendly study quiz for 5th grade social studies — Colonial America, Chapters 5 & 6.

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

### 🔒 Parent Mode
Password-protected area to:
- View answer keys for all three quiz sections
- Edit any question, answer, term, or definition
- Reset all customizations back to defaults

## Tech Stack

- **Single HTML file** — no build step, no dependencies, no server
- **localStorage** for persistence (progress + parent edits)
- **Canvas API** for all battle characters and animations (no external images)
- **Azure Static Web Apps** (free tier) with auto-deploy from GitHub

## Running Locally

Open `index.html` in any modern browser. That's it.

## Testing

Open `tests.html` in a browser — 43 unit tests covering quiz logic and battle mechanics run automatically.

## Deployment

Push to `master` → GitHub Actions auto-deploys to Azure Static Web Apps.

## File Structure

```
socialtest/
├── index.html                # The entire quiz app
├── tests.html                # 43 unit tests (browser-based)
├── README.md                 # This file
├── WORKLOG.md                # Detailed work log & decision history
├── staticwebapp.config.json  # Security headers (CSP, X-Frame-Options)
└── .github/
    └── workflows/            # Azure SWA deploy workflow
```

## Security

- Parent mode password hashed with SHA-256 (never stored in plaintext)
- All user input sanitized with HTML entity escaping (`esc()`)
- Content Security Policy headers block external scripts and images
- No external dependencies or CDN loads

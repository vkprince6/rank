# Leaderboard — Live Ranking Board

A live, auto-refreshing ranking board with animated podium, climb animations, and confetti — powered by Google Sheets as the backend.

## Features

- **Top 3 podium** with trophy/medal icons (🏆🥈🥉), large display cards
- **Ranks 4+** in a clean leaderboard table
- **Auto-refresh** every 10 seconds with countdown in the top bar
- **Manual refresh** via button (top-right or bottom)
- **Climb animation** overlay when a new person hits #1
- **Confetti celebration** on every data update
- **College name** with inline edit (pencil icon, saved to localStorage)
- **Mobile responsive** — adapts to all screen sizes

## Setup

### 1. Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Add these headers in row 1:

   | A           | B    | C     |
   |-------------|------|-------|
   | timestamp   | name | score |

### 2. Add the Apps Script

1. In your Sheet: **Extensions > Apps Script**
2. Paste the contents of `google-apps-script/Code.gs`
3. Click **Save**

### 3. Deploy the Web App

1. **Deploy > New deployment**
2. Select type → **Web app**
3. Settings:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy** and copy the Web App URL

> "Who has access" **must** be **Anyone** to avoid CORS errors.

### 4. Configure the Frontend

Open `app.js` and replace the API URL:

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/YOUR_ID/exec",
  REFRESH_INTERVAL: 10, // seconds
};
```

### 5. Deploy

Host on GitHub Pages and open the URL. The board auto-refreshes every 10 seconds.

## How It Works

- Google Sheet stores name + score rows
- Apps Script deduplicates by name (keeps best score), sorts descending
- Frontend polls the API every 10s
- Top 3 render as podium boxes; ranks 4+ as table rows
- If a new person jumps to #1 (wasn't in previous top 3), a climb animation plays
- Confetti celebrates every refresh

## File Structure

```
leaderboard/
├── index.html              # Main page
├── styles.css              # Main UI styles
├── climb-styles.css        # Climb animation overlay styles
├── animations.js           # Background stars animation
├── app.js                  # Frontend logic (fetch, render, confetti)
├── climb.js                # Climb detection + animation engine
├── google-apps-script/
│   └── Code.gs             # Google Apps Script backend
└── README.md               # This file
```

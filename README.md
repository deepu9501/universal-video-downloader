# Universal Video Downloader

A modern universal video downloader platform supporting:

- YouTube Videos
- YouTube Shorts
- Instagram Reels
- Instagram Videos
- Facebook Videos
- TikTok Videos
- Twitter/X Videos

## Tech Stack

Frontend:
- React.js
- Tailwind CSS

Backend:
- Node.js
- Express.js
- yt-dlp

## Features

- No signup required
- Instant video download
- Mobile responsive
- Fast UI
- Multi-platform support

## Deployment

### Backend on Render

Use one of these configurations, not both:

- If Render root directory is the repository root:
  - Build command: `npm --prefix backend install`
  - Start command: `npm --prefix backend start`
- If Render root directory is `backend`:
  - Build command: `npm install`
  - Start command: `npm start`

Do not use `cd backend && npm install` when the Render root directory is already `backend`, because Render will run the command from inside `backend` and fail with `cd: backend: No such file or directory`.

### Frontend on Vercel

Set `VITE_API_BASE_URL` to the Render backend URL:

```text
https://all-in-one-video-downloader-u7f9.onrender.com
```

If this variable is missing, the production frontend falls back to the same Render URL. During local Vite development, the frontend uses `/api` and the local Vite proxy.

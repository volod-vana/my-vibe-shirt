# Tee Designer

Generate a custom t-shirt design from your Instagram aesthetic and Spotify music taste. Powered by [Vana Connect](https://www.vana.com/) and Google Gemini.

## How it works

1. Connect your Instagram & Spotify data through Vana
2. Gemini 2.5 analyzes your photos and music to craft a design prompt
3. Nano-banana (Gemini image generation) creates a unique t-shirt graphic

## Setup

```bash
pnpm install
pnpm dev   # Opens on http://localhost:3001
```

Environment variables:

```
VANA_APP_PRIVATE_KEY=0x...
APP_URL=http://localhost:3001
GEMINI_API_KEY=...
```

## Tech Stack

Next.js 15, React 19, TypeScript, Vana Connect SDK, Google GenAI SDK

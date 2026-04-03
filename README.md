# FB Soccer Quiz (Instant Games)

Monorepo: **Vite + TypeScript** Instant Games client, **Express + MySQL** API, shared types.

## Prerequisites

- Node.js 20+
- MySQL 8 (local install, or Docker — see `docker-compose.yml`)

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   - Copy [`server/.env.example`](server/.env.example) to [`server/.env`](server/.env). Set `MYSQL_PASSWORD` and optional `META_APP_SECRET` (and `VITE_*` keys for the client).

3. **Database**

   ```bash
   npm run db:create
   npm run migrate
   npm run seed
   ```

4. **Run**

   ```bash
   npm run dev:server
   npm run dev:client
   ```

   Open the Vite URL (default `http://127.0.0.1:5173`). With `DEV_AUTH_BYPASS=1` in `server/.env`, the client sends `X-Dev-Player-Id` so you can test outside Facebook.

## Build & test

```bash
npm test
npm run build
```

## Meta / Instant Games

See [docs/META_INSTANT_GAMES_CHECKLIST.md](docs/META_INSTANT_GAMES_CHECKLIST.md) before submitting your game.

## Layout

| Directory | Purpose        |
| --------- | -------------- |
| `client/` | Vite Instant Games UI |
| `server/` | Express REST API, Knex migrations |
| `shared/` | Shared TypeScript types |

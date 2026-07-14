# Session Game App

Private React/TypeScript frontend for the `session-game-core` Supabase project.

## Implemented in v0.9

- Supabase Auth with password and magic-link login.
- Role-aware session directory using `get_app_bootstrap`.
- Dom Control Room using `get_dom_control_room`.
- Sub Dashboard using `get_my_session_state`.
- Idempotent operator commands using `execute_operator_command`.
- Optimistic concurrency through `state_revision`.
- Realtime invalidation for sessions, turns, tasks, safety, consent, debt and commands.
- Safety controls for Yellow, Red, session pause and participation withdrawal.
- Operator alert acknowledgement.
- Private paid task-view access for eligible Sub participants.
- Responsive desktop/mobile shell without a UI framework.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set the public Supabase anon key in `.env.local`:

```env
VITE_SUPABASE_URL=https://uflmnekgpmbudvitttsp.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

Never commit service-role keys, database passwords, access tokens or `.env.local`.

## Production build

```bash
npm run typecheck
npm run build
npm run preview
```

The generated static app is written to `dist/` and can be deployed to Vercel, Netlify, Cloudflare Pages or any static host with SPA fallback to `index.html`.

## Required Supabase RPC surface

Client-facing RPCs:

- `get_app_bootstrap`
- `list_my_sessions`
- `get_dom_control_room`
- `get_my_session_state`
- `execute_operator_command`
- `acknowledge_operator_alert`
- `record_safety_signal`
- `grant_task_view_access`

Gameplay mutations from the Dom UI should go through `execute_operator_command` rather than calling low-level RPCs directly.

## Repository layout

```text
src/
  components/   shared UI and command dialog
  hooks/        auth, realtime and command hooks
  lib/          Supabase client, RPC client and types
  pages/        Login, directory, Dom Control Room and Sub Dashboard
```

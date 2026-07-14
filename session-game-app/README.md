# Session Game App

Private React/TypeScript frontend for the `session-game-core` Supabase project.

## v1.0 workflow

- Supabase Auth registration with email/password, password login and magic link.
- Role-aware session directory using `get_frontend_bootstrap`.
- One-click synthetic demo creation through `create_demo_session_with_invite`.
- Single-use, expiring Sub invite tokens.
- Email-restricted invite claims through `claim_session_invite`.
- Dom Control Room using `get_dom_control_room`.
- Sub Dashboard using `get_my_session_state`.
- Idempotent operator commands using `execute_operator_command`.
- Optimistic concurrency through `state_revision`.
- Realtime invalidation for sessions, turns, tasks, safety, consent, debt, ranking and commands.
- Safety controls for Yellow, Red, session pause and participation withdrawal.
- Private paid task-view access before a task starts.

## Hosted deployment

The GitHub Pages workflow builds from `session-game-app/` and targets:

```text
https://hellodalathostel.github.io/private-/
```

The app uses hash routing, so direct routes remain compatible with static hosting.

GitHub Actions workflow:

```text
.github/workflows/session-game-app-pages.yml
```

The publishable Supabase key is intentionally safe for browser use. Never place a service-role key, database password or private token in the frontend or workflow.

## Required Supabase Auth setting

In Supabase Dashboard, add this exact URL under **Authentication → URL Configuration → Redirect URLs**:

```text
https://hellodalathostel.github.io/private-/
```

Keep local development URLs separately, for example:

```text
http://localhost:5173/
```

## First demo session

1. Open the hosted app and create the Dom account.
2. Sign in and choose **Tạo demo và mã mời**.
3. Optionally restrict the invite to the Sub email.
4. Copy the generated single-use token.
5. Create or sign in to the Sub account.
6. Enter the token under **Nhận participant**.
7. Dom opens the Control Room; Sub is routed to the Sub Dashboard.

Invite properties:

- SHA-256 token hash stored in the database; raw token is returned only when created.
- Single use.
- Default demo expiry: seven days.
- Optional exact-email restriction.
- Existing linked participants cannot be claimed again.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

```env
VITE_SUPABASE_URL=https://uflmnekgpmbudvitttsp.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_publishable_key
VITE_BASE_PATH=/
```

## Production validation

```bash
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs validation for changes under `session-game-app/`.

## Client-facing RPC surface

- `get_frontend_bootstrap`
- `get_my_session_directory`
- `create_demo_session_with_invite`
- `create_session_invite`
- `claim_session_invite`
- `get_dom_control_room`
- `get_my_session_state`
- `execute_operator_command`
- `acknowledge_operator_alert`
- `record_safety_signal`
- `grant_task_view_access`

Gameplay mutations from the Dom UI should go through `execute_operator_command` rather than calling low-level RPCs directly.

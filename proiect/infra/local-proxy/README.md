# Local Proxy

This proxy mirrors the deployment-style routing you described:

- `http://focusflow.local/api/auth/...` -> Auth service
- `http://focusflow.local/api/calendar/...` -> Calendar service
- `http://focusflow.local/api/recommendations/...` -> Recommendations service
- `http://focusflow.local/api/billing/...` -> Billing service
- `http://focusflow.local/api/advertising/...` -> Advertising service
- `http://focusflow.local/` -> frontend dev server

## Why this setup

Your backend is split into multiple services locally, but deployment will expose them behind one HTTP route config under `/api/...`.
This `nginx` container gives you nearly the same shape on localhost, so the frontend can call one origin instead of hardcoding separate ports.

## Files

- `docker-compose.yml`: runs the local reverse proxy
- `.env.example`: upstream host/port settings
- `nginx/default.conf.template`: route mapping

## One-time host entry

Add this to your hosts file:

```text
127.0.0.1 focusflow.local
```

On Windows, edit:

`C:\Windows\System32\drivers\etc\hosts`

## Start

1. Copy `.env.example` to `.env`
2. Start your backend services on their current ports:
   - Auth: `3001`
   - Calendar: `3000`
   - Recommendations: `3002`
   - Billing: `3003`
   - Advertising: `3004`
3. Start your frontend dev server
4. From this folder run:

```bash
docker compose up -d
```

Or from the repo root use the helper script:

```powershell
.\scripts\start-local-stack.ps1
```

To stop everything:

```powershell
.\scripts\stop-local-stack.ps1
```

## Frontend upstream

By default, `/` proxies to:

```text
host.docker.internal:8081
```

If your frontend runs on a different port, change `FRONTEND_UPSTREAM` in `.env`.

## Example URLs

- `http://focusflow.local/`
- `http://focusflow.local/api/auth/login`
- `http://focusflow.local/api/calendar/events`
- `http://focusflow.local/api/billing/subscription`

## Notes

- On Windows with Docker Desktop, `host.docker.internal` is the right way for the container to reach services running on your machine.
- If port `80` is already in use, change `PROXY_PORT` in `.env` to something like `8080`, then use `http://focusflow.local:8080/`.
- This proxy does not replace your deployed route config, it just gives you a local version with the same URL shape.

# Ozichat Admin — Deployment

The admin panel is a static React SPA. It has no runtime dependency on the
mobile/landing apps in this repo — when deployed it only needs:

- The built `admin/index.html`
- The shared `assets/` chunks Vite emits
- A reachable backend (URL configured at build time via `API_BASE_URL`)

## Build

```bash
# from the repo root
API_BASE_URL=https://your-backend.example.com/api/v1 npm run build
```

Vite emits three entry HTMLs into `dist/`:

```
dist/
├── index.html          # mobile/user app  (skip for admin-only deploy)
├── admin/index.html    # ← admin SPA
├── landing/index.html  # marketing landing
└── assets/             # hashed JS/CSS chunks (shared by all entries)
```

## Deploy admin-only to AWS

The simplest pattern: deploy just `dist/admin/index.html` + `dist/assets/`
to an S3 bucket fronted by CloudFront. Two URL conventions work:

### Option A — Subpath `/admin/`

Keep the directory shape and serve at `https://yourdomain.com/admin/`:

```bash
aws s3 cp dist/admin/index.html s3://your-bucket/admin/index.html --cache-control "no-cache"
aws s3 sync dist/assets/ s3://your-bucket/assets/ --cache-control "public,max-age=31536000,immutable"
```

### Option B — Root domain (admin-only host)

If admin gets its own host like `admin.yourdomain.com`, place it at root:

```bash
aws s3 cp dist/admin/index.html s3://admin-bucket/index.html --cache-control "no-cache"
aws s3 sync dist/assets/ s3://admin-bucket/assets/ --cache-control "public,max-age=31536000,immutable"
```

In CloudFront, set default root object to `index.html`.

## Backend URL

`API_BASE_URL` is **inlined at build time** by Vite (see `vite.config.ts`).
Set it before running `npm run build`:

| Where admin lives        | Where API lives                   | API_BASE_URL                              |
| ------------------------ | --------------------------------- | ----------------------------------------- |
| `admin.example.com`      | `api.example.com`                 | `https://api.example.com/api/v1`          |
| Same host, reverse-proxy | `example.com/api/*` → backend     | leave empty (relative `/auth/...` works)  |
| Local dev                | `http://localhost:8080`           | `http://localhost:8080/api/v1`            |

If `API_BASE_URL` is empty, the admin will call relative paths
(`/auth/register/admin`, etc.) — useful when the same host that serves the
admin SPA reverse-proxies `/api/v1/*` to the backend.

## CORS

If admin and API are on different origins, the backend must respond with:

```
Access-Control-Allow-Origin: https://admin.example.com
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

The admin sends `Authorization: Bearer <accessToken>` on every request after
login/register — no cookies required.

## First admin

The first admin is created via the **Create admin** tab on the login screen.
This calls `POST /auth/register/admin` and requires the shared `adminSecret`
that's configured on the backend.

Tokens are persisted in `localStorage` under key `ozi_admin_session_v1`. The
admin is auto-signed-out when the `accessToken` expiry passes.

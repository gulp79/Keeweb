# KeePass Web 🔐

A production-ready, **offline-first**, KeePass-compatible password manager PWA built with React + TypeScript + Vite.

> **All encryption is 100% client-side — no secrets ever leave your browser.**

---

## Features

- Open, create, and save `.kdbx` KDBX 4.x databases
- Unlock with password, key file, or both (composite key)
- Argon2id as default KDF (via kdbxweb + argon2-browser)
- Create, edit, move, delete groups and entries
- Standard fields: Title, Username, Password (masked), URL, Notes (Markdown)
- Custom fields and file attachments
- Password generator (length, charset, entropy display)
- Fuzzy search across all entries (Fuse.js)
- Auto-lock on inactivity + clipboard auto-clear
- Entry edit history
- Google Fonts favicons for URLs (fail gracefully offline)
- PWA — installable, works offline
- Dark theme by default, light mode toggle
- English + Italian i18n
- ARIA-accessible, keyboard shortcuts (Ctrl+F search, Ctrl+N new entry, Ctrl+S save)

## Architecture

```
src/
├── components/
│   ├── ui/         # Button, Input, Modal, Toast, Tooltip, Badge
│   ├── layout/     # Sidebar (groups tree), TopBar (search/actions)
│   ├── entry/      # EntryList, EntryEditor (General/Custom Fields/Attachments/History)
│   └── generator/  # GeneratorPanel
├── features/
│   ├── db/         # Zustand store — databases, groups, entries
│   ├── crypto/     # kdbxweb adapter + password generator
│   ├── storage/    # StorageProvider abstraction (Local + stubs)
│   └── settings/   # Persisted app settings (Zustand + localStorage)
├── hooks/          # useAutoLock, useClipboard, useFuzzySearch, useToast
├── i18n/           # en + it translations
├── routes/         # /unlock, /db/:id, /settings
└── types/          # Strict TypeScript models
```

## Security Model

| Concern | Approach |
|---------|----------|
| Database encryption | kdbxweb (KDBX 4.x, Argon2id KDF) |
| Randomness | `crypto.getRandomValues` (WebCrypto) |
| In-memory only | Decrypted data in Zustand; zeroed on lock |
| Clipboard | Auto-cleared after configurable timeout |
| Auto-lock | Inactivity timer (configurable, default 5 min) |
| No telemetry | Zero analytics or external requests |
| CSP | `default-src 'self'` with minimal exceptions |

## Running Locally

```bash
# Requires Node >= 20
nvm use
npm ci
npm run dev     # http://localhost:5173
```

## Build

```bash
npm run build       # outputs dist/
npm run preview     # serve production build
```

## Testing

```bash
npm test                # Vitest unit tests
npm run test:coverage   # with coverage report
npm run test:e2e        # Playwright E2E (needs build first)
```

## Generate PWA Icons

```bash
npx pwa-asset-generator public/icons/favicon.svg public/icons \
  --manifest public/manifest.webmanifest \
  --icon-only --background "#0f172a"
```

## Manual NGINX Deployment (Linux)

```bash
# 1. Build
npm ci && npm run build

# 2. Copy to server
rsync -avz dist/ user@your-server:/var/www/keepass-web/dist/

# 3. Install nginx config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/keepass-web
sudo sed -i 's/your-domain.example.com/yourdomain.com/g' \
  /etc/nginx/sites-available/keepass-web
sudo ln -sf /etc/nginx/sites-available/keepass-web \
  /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. TLS
sudo certbot --nginx -d yourdomain.com

# 5. Set ownership
sudo chown -R www-data:www-data /var/www/keepass-web
```

## Docker

```bash
# Build + run
docker compose up -d --build
# App: http://localhost:8080

# Or pull from GHCR (after CI push)
docker run -p 8080:80 ghcr.io/YOUR_ORG/keepass-web:latest
```

## GitHub Actions CI/CD

The workflow (`.github/workflows/build.yml`) runs:

1. **lint-and-test** — typecheck + ESLint + Vitest unit tests
2. **build** — `npm run build` → uploads `dist/` artifact (30-day retention)
3. **e2e** — Playwright tests in headless Chromium
4. **docker** — builds + pushes Docker image to GHCR on `main` or version tags

To enable Docker push: add a `GHCR_PAT` secret (GitHub PAT with `write:packages` scope).

To download the build artifact: **Actions → your run → Artifacts → dist-{sha}**

## Security Headers (NGINX)

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'` + allowlists |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | geolocation=(), microphone=(), camera=() |

> ⚠️ Enable HSTS only after confirming HTTPS works end-to-end.

## Roadmap / TODOs

- [ ] WebDAV / Dropbox / Google Drive storage providers (stubs in `localStorageProvider.ts`)
- [ ] WebAuthn / Passkey unlock
- [ ] CSV / JSON import-export
- [ ] Multi-tab DB conflict detection
- [ ] Offline favicon caching

## License

MIT — © 2024 KeePass Web Contributors

Third-party libraries: kdbxweb (MIT), argon2-browser (MIT), React (MIT),
Zustand (MIT), Tailwind CSS (MIT), Headless UI (MIT), Fuse.js (Apache-2.0),
lucide-react (ISC), react-markdown (MIT), date-fns (MIT).

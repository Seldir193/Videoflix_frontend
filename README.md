# 📺 Videoflix UI

## Angular Frontend of the Netflix Clone

**Angular 17 · SCSS · RxJS · ngx-translate · Plyr**

The frontend talks to the Videoflix API (Django / DRF), streams adaptive MP4
variants, remembers the playback position and supports account-activation and
password-reset flows.

| Layer / Purpose | Tech & Libraries                    |
| --------------- | ----------------------------------- |
| **Frontend**    | Angular 17 · Stand-alone Components |

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Quick Start](#quick-start)
3. [Frontend Testing](#frontend-testing)
4. [Deployment Notes](#deployment-notes)
5. [License](#license)

---

## Project Structure (Frontend)

```text
videoflix-ui/
└─ src/
   ├─ app/
   │  ├─ auth/                              # sign-up, login, activation
   │  │  ├─ activate/
   │  │  ├─ forgot-password/
   │  │  ├─ login/
   │  │  ├─ reset-password/
   │  │  └─ signup/
   │  │
   │  ├─ core/                              # global services & shell components
   │  │  ├─ layout-shell/
   │  │  │  ├─ header/
   │  │  │  └─ footer/
   │  │  ├─ auth.guard.ts
   │  │  ├─ auth.service.ts
   │  │  ├─ jwt.interceptor.ts
   │  │  └─ token-refresh.interceptor.ts
   │  │
   │  ├─ dashboard/                         # home page, video grid
   │  │  ├─ video-grid/
   │  │  └─ dashboard.routes.ts
   │  │
   │  ├─ movie-info/                        # single-movie detail page
   │  ├─ watch/                             # player page (Plyr)
   │  ├─ imprint/                           # imprint
   │  ├─ policy/                            # privacy policy
   │  ├─ shared/
   │  │  ├─ email-capture/
   │  │  ├─ models/
   │  │  │  └─ safe-url.pipe.ts
   │  │  ├─ toast/                          # global toast component
   │  │  └─ video.service.ts
   │  ├─ app.component.ts
   │  ├─ app.config.ts
   │  └─ app.routes.ts
   │
   ├─ assets/
   │  ├─ i18n/                              # ngx-translate JSONs
   │  ├─ img/
   │  │  ├─ thumbs/
   │  │  └─ trailer/
   │  └─ …
   │
   └─ environments/
      ├─ environment.ts
      └─ environment.prod.ts
```

## Quick Start

```bash
git clone <repo-url>
cd videoflix-ui
npm ci
npm start


Note (EN)
The quick-start runs in development mode (.env.dev) and expects the API
on http://localhost:8000.
To test the production setup locally, copy
.env.example → .env (or .env.template → .env)
and start:
python backend/manage.py runserver 8001,
or spin up the Docker stack (web_prod with Nginx).


```

## Frontend-Testing

Unit tests (Karma + Jasmine) ng test
End-to-End tests (E2E) ng e2e

## Deployment Notes

ng build --configuration production

# ⇒ dist/videoflix-ui/

## License

MIT License • © 2025 Selcuk Kocyigit
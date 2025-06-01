# 📺 Videoflix – Full-Stack

**Full-stack Netflix clone** powered by **Angular 17.3** (frontend) and  
**Django 4 + PostgreSQL** (API).  
Streams adaptive MP4 variants, remembers the last playback position, sends
activation and reset-password emails, and stores progress every 5 seconds.

| Layer / Purpose    | Tech & Libraries                                               |
| ------------------ | -------------------------------------------------------------- |
| **Frontend**       | Angular 17 · SCSS · RxJS · ngx-translate · Plyr                |
| **Backend API**    | Django 4 · Django REST Framework · djoser · SimpleJWT          |
| **Database**       | PostgreSQL 16                                                  |
| **Queue / Cache**  | Redis 6 · django-rq · django-redis                             |
| **Extras**         | django-modeltranslation · django-import-export · debug-toolbar |
| **Static / Media** | WhiteNoise (dev) · Nginx + `sendfile` (prod)                   |

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Quick Start (no Docker)](#quick-start-no-docker)
3. [Docker Stacks](#docker-stacks)  
   • Development stack  
   • Production stack
4. [Deployment Tips](#deployment-tips)
5. [License](#license)

---

## Project Structure (Backend)

```text
videoflix-backend/
├── accounts/
│   ├── email.py
│   ├── __init__.py
│   └── …                    # models, signals …
├── users/
│   ├── admin.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── apps.py
├── videos/
│   ├── admin.py
│   ├── models.py
│   ├── serializers.py
│   ├── tasks.py               # FFmpeg transcoding
│   ├── translation.py
│   └── views.py
├── media/                     # uploaded originals & renditions
│   ├── thumbs/
│   └── videos/                # preview images
├── static/                    # created by collectstatic (WhiteNoise / Nginx)
├── templates/
│   └── djoser/email/
│       ├── activation.html
│       ├── activation.txt
│       ├── reset_password.html
│       └── password_reset.txt
├── videoflix/                 # Django project root
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py / asgi.py
├── env/                       # (optional) local virtual-env
├── Dockerfile.backend
├── backend.entrypoint.sh
├── .dockerignore
├── .env              (prod variables)
├── .env.dev          (dev variables)
├── .env.template     (sample)
├── docker-compose.yml
├── nginx.conf        (prod reverse-proxy)
├── requirements.txt
├── dump.sql / backup.dump     # (optional) DB dump
├── manage.py
├── README.md
└── README-docker-setup.md

```

## 🚀 Quick Start (no Docker)

```bash
# Frontend
npm i
npm run start

# Backend (Python 3.11)
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env.dev
python backend/manage.py createsuperuser
python backend/manage.py runserver 8000   # http://localhost:8000

Note (EN)
The quick-start runs in development mode (.env.dev) and expects the API
on http://localhost:8000.
To test the production setup locally, copy
.env.example → .env (or .env.template → .env)
and start:
python backend/manage.py runserver 8001,
or spin up the Docker stack web_prod with Nginx.

```

## Docker-Stacks

docker compose down -v
docker system prune -a --volumes  
docker compose build --no-cache web_dev web_prod rqworker nginx

## Development Stack

docker compose stop web_prod nginx
docker compose --env-file .env.dev up -d db redis web_dev rqworker
docker compose exec web_dev python manage.py migrate
docker compose exec web_dev python manage.py createsuperuser
docker compose logs -f web_dev

## Production Stack

docker compose stop web_dev rqworker
docker compose --env-file .env up -d db redis web_prod rqworker nginx
docker compose exec web_prod python manage.py migrate
docker compose logs -f web_prod

## Deployment Tips

apt install certbot
certbot --nginx -d videoflix.selcuk-kocyigit.de

## MIT License • © 2025 Selcuk Kocyigit

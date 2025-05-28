# VideoflixUi

# 📺 Videoflix

**Full-stack Netflix-Clone** powered by **Angular 17.3** (frontend) und  
**Django 4 + PostgreSQL** (API).  
Streamt MP4-Varianten, merkt die letzte Position, versendet
Aktivierungs- und Reset-E-Mails und speichert Fortschritt im 5-Sek-Takt.

| Layer        | Tech / Libs                                                    |
|--------------|----------------------------------------------------------------|
| Frontend     | Angular 17.3 · SCSS · Plyr · ngx-translate                     |
| Backend API  | Django 4 · Django REST Framework · djoser · SimpleJWT          |
| DB           | PostgreSQL 16                                                  |
| Queue/Cache  | Redis 6 + django-rq · django-redis                             |
| Extras       | modeltranslation · import-export · debug-toolbar               |

---

## 🚀 Schnellstart

### Lokal (ohne Docker)

```bash
# Frontend
npm i
npm run start          # http://localhost:4200

# Backend (Python 3.11)
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
python backend/manage.py migrate --settings=config.settings.local
python backend/manage.py runserver 8000

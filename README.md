# Personal website rust

My personal portfolio website build in rust with the Loco framework as a backend and React as a frontend.

## Table of Contents
- [Technologies](#technologies)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Technologies
- Rust
- Loco
- TypeScript
- React

## Features
- {{Feature 1}}
- {{Feature 2}}

## Installation
{{Installation steps}}

## Usage
### 1 Required files
Create these files at repo root:

- `.env` (production secrets)
- `docker-compose.yml`

In `backend/config/production.yaml`, use env vars (already done in your setup).

### 2 Minimal `.env`
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=backend

JWT_SECRET=change_me_long_random_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

SMTP_HOST=mail.your-server.de
SMTP_USER=your@email.com
SMTP_PASSWORD=your_smtp_password

APP_HOST=https://your-domain.com
```

### 3 Start on server
```bash
docker compose up -d --build
docker compose ps
```

### 4 Verify
```bash
docker compose logs backend --tail==100
docker compose logs frontend --tail==100
```

### 5 Open site
- http://<server-ip> (quick test)
- https://your-domain.com (production)

### 6 (Optional) Seed test/admin users
```bash
docker compose exec backend ./backend-cli db seed
```

```bash
$ curl --location 'localhost:5150/api/auth/register' \
     --header 'Content-Type: application/json' \
     --data-raw '{
         "name": "Loco user",
         "email": "user@loco.rs",
         "password": "12341234"
     }'
```

## License

This project is licensed under the MIT license.
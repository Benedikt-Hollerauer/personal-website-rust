# Personal Website (Rust)

My personal portfolio website built with Rust/Loco as a backend and React as a frontend.

## Stack

- **Backend:** Rust, [Loco](https://loco.rs/) (Axum-based), PostgreSQL
- **Frontend:** React, TypeScript, CSS Modules
- **Infra:** Docker Compose, Caddy (automatic TLS), docker-mailserver

---

## Server Setup Guide

Complete guide for deploying from scratch on a new VPS. Steps marked **[one-time]** only need to be done once and survive all future deploys.

### 1. Prerequisites

- VPS running Ubuntu/Debian with Docker and Docker Compose installed
- A domain with access to its DNS settings
- SSH access to the server

### 2. Clone the repo [one-time]

```bash
git clone https://github.com/YOUR_USERNAME/personal-website-rust.git /srv/personal-website-rust
cd /srv/personal-website-rust
```

### 3. Configure `.env` [one-time]

The deploy script auto-creates `.env` from `.env.example` on first run, adding any missing keys on subsequent runs without overwriting existing values. On a fresh server, run it once manually before the first deploy:

```bash
bash scripts/init-env.sh
```

Then edit `.env` and fill in all placeholder values:

```env
POSTGRES_USER=backend
POSTGRES_PASSWORD=change_me_strong_password
POSTGRES_DB=backend

JWT_SECRET=change_me_very_long_random_secret_key

# reCAPTCHA v3 — get both keys at https://www.google.com/recaptcha/admin
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key   # public, baked into frontend at build time
RECAPTCHA_SECRET_KEY=your_recaptcha_v3_secret_key     # private, used by backend at runtime

# Must match the account created in step 6
SMTP_USER=contact@your-domain.com
SMTP_PASSWORD=your_smtp_password_here

APP_HOST=https://your-domain.com
```

> `SMTP_HOST` is already hardcoded to the internal `mailserver` container in `docker-compose.yml` and does not belong in `.env`.

> `VITE_RECAPTCHA_SITE_KEY` is a **build-time** variable baked into the frontend image. If you change it, rebuild the frontend: `docker compose up -d --build frontend`.

### 4. DNS records [one-time]

Add these before starting the stack — Caddy needs them to obtain TLS certificates.

| Type | Name | Value |
|------|------|-------|
| A | `@` | `YOUR_SERVER_IP` |
| A | `mail` | `YOUR_SERVER_IP` |
| MX | `@` | `mail.your-domain.com.` (priority 10, trailing dot required) |
| TXT | `@` | `v=spf1 ip4:YOUR_SERVER_IP mx ~all` (only one SPF record allowed) |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@your-domain.com` |

The DKIM record is added after first start (see step 7).

### 5. Start the stack

```bash
docker compose up -d --build
```

Caddy automatically obtains TLS certificates for both `your-domain.com` and `mail.your-domain.com`. Wait ~30 seconds before continuing.

```bash
docker compose ps   # all containers should show "Up"
```

### 6. Add the mail account [one-time]

```bash
docker exec -it personal-website-rust-mailserver-1 setup email add contact@your-domain.com
```

Enter the same password you set as `SMTP_PASSWORD` in `.env`.

### 7. Generate DKIM keys and add DNS record [one-time]

```bash
docker exec -it personal-website-rust-mailserver-1 setup config dkim
docker compose restart mailserver
```

Retrieve the public key:

```bash
docker exec personal-website-rust-mailserver-1 \
  cat /tmp/docker-mailserver/opendkim/keys/your-domain.com/mail.txt
```

Add it as a DNS TXT record — concatenate the quoted segments into one string:

| Type | Name | Value |
|------|------|-------|
| TXT | `mail._domainkey` | `v=DKIM1; h=sha256; k=rsa; p=YOUR_PUBLIC_KEY` |

### 8. Hetzner-specific [one-time]

1. **Unblock port 25** — Hetzner console → your server → *Networking* → request port 25 unblocking. Required for sending and receiving email between mail servers.
2. **Reverse DNS (PTR)** — same *Networking* tab, set the IPv4 rDNS entry to `mail.your-domain.com`. Prevents outgoing mail from being flagged as spam.

### 9. Verify mail

Configure a mail client (e.g. Thunderbird):

| | Value |
|-|-------|
| IMAP | `mail.your-domain.com`, port `993`, SSL/TLS |
| SMTP | `mail.your-domain.com`, port `587`, STARTTLS |
| Username | `contact@your-domain.com` |

Check logs if something fails:

```bash
docker compose logs mailserver --tail=50
```

### 10. GitHub Actions CI/CD [one-time]

Pushes to `main` deploy automatically via SSH. Add these secrets to your GitHub repository:

| Secret | Value |
|--------|-------|
| `SSH_HOST` | Server IP |
| `SSH_PORT` | SSH port (usually `22`) |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | Private key with server access |

---

## What survives rebuilds

| Data | Storage | Survives `--build` |
|------|---------|-------------------|
| PostgreSQL data | `postgres_data` Docker volume | Yes |
| Uploaded files | `uploads` Docker volume | Yes |
| Caddy TLS certs | `caddy_data` Docker volume | Yes |
| Mail inbox data | `mail_data` Docker volume | Yes |
| Mail account passwords | `mailserver-config/postfix-accounts.cf` (bind mount, gitignored) | Yes |
| DKIM private keys | `mailserver-config/opendkim/` (bind mount, gitignored) | Yes |
| Sieve rules (auto-reply, forwarding) | `mailserver-config/sieve/` (bind mount, **in git**) | Yes |
| `.env` secrets | Manually created file, gitignored | Yes |

On a **brand new server**, only steps **6, 7, and 8** need repeating — add the mail account, regenerate DKIM keys, update the DNS DKIM record.

---

## Local Development

All configuration lives exclusively in the root `.env.example` / `.env`. Run the init script once to set everything up:

```bash
bash scripts/init-env.sh
```

This creates root `.env` from `.env.example` (if missing) and auto-generates `frontend/.env` from the `VITE_*` vars inside it. Fill in the placeholder values in `.env`, then:

### Backend

```bash
cd backend
cargo run
```

The backend reads env vars directly from the shell. Export them from the root `.env` first:

```bash
export $(grep -v '^#' .env | xargs)
cd backend && cargo run
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # reads frontend/.env generated by init-env.sh
```

---

## License

MIT

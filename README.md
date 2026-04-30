# Personal Website (Rust)

My personal portfolio website built with Rust/Loco as a backend and React as a frontend.

## Stack

- **Backend:** Rust, [Loco](https://loco.rs/) (Axum-based), PostgreSQL
- **Frontend:** React, TypeScript, CSS Modules
- **Infra:** Docker Compose, Caddy (TLS), docker-mailserver

## Server Setup Guide

This is a complete guide to deploying from scratch on a new VPS. Steps marked **[one-time]** only need to be done once and survive future deploys.

---

### 1. Prerequisites

- VPS running Ubuntu/Debian with Docker and Docker Compose installed
- A domain with access to its DNS settings
- SSH access to the server

---

### 2. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/personal-website-rust.git /srv/personal-website-rust
cd /srv/personal-website-rust
```

---

### 3. Create `.env` [one-time]

Create `/srv/personal-website-rust/.env` — this file is gitignored and must be created manually on each server:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me_strong_password
POSTGRES_DB=backend

JWT_SECRET=change_me_long_random_secret

RECAPTCHA_SECRET_KEY=your_recaptcha_v3_secret_key

SMTP_USER=contact@your-domain.com
SMTP_PASSWORD=your_mail_account_password

APP_HOST=https://your-domain.com
```

> `SMTP_HOST` is already set to `mailserver` in `docker-compose.yml` and does not need to be in `.env`.

---

### 4. DNS records [one-time]

Add these records in your DNS provider before starting the stack. Caddy needs them to obtain TLS certificates.

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `@` | `YOUR_SERVER_IP` | Main domain |
| A | `mail` | `YOUR_SERVER_IP` | Mail subdomain |
| MX | `@` | `mail.your-domain.com.` | Priority 10, trailing dot required |
| TXT | `@` | `v=spf1 ip4:YOUR_SERVER_IP mx ~all` | SPF — only one SPF record allowed |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@your-domain.com` | DMARC |

The DKIM record is added after first start (see step 7).

---

### 5. Start the stack

```bash
docker compose up -d --build
```

Caddy will automatically obtain TLS certificates for both `your-domain.com` and `mail.your-domain.com` via Let's Encrypt. Wait ~30 seconds for this to complete before proceeding.

Verify all containers are running:

```bash
docker compose ps
```

---

### 6. Add the mail account [one-time]

```bash
docker exec -it personal-website-rust-mailserver-1 setup email add contact@your-domain.com
```

You will be prompted to enter a password. Use the same password you set as `SMTP_PASSWORD` in `.env`.

---

### 7. Generate DKIM keys and add DNS record [one-time]

```bash
docker exec -it personal-website-rust-mailserver-1 setup config dkim
```

Then retrieve the public key:

```bash
docker exec personal-website-rust-mailserver-1 cat /tmp/docker-mailserver/opendkim/keys/your-domain.com/mail.txt
```

Add the output as a DNS TXT record:

| Type | Name | Value |
|------|------|-------|
| TXT | `mail._domainkey` | `v=DKIM1; h=sha256; k=rsa; p=YOUR_PUBLIC_KEY` |

The key value is split across multiple quoted strings in the output — concatenate them into one string (remove the quotes and whitespace between segments).

Restart the mailserver to load the keys:

```bash
docker compose restart mailserver
```

---

### 8. Hetzner-specific steps [one-time]

If hosting on Hetzner:

1. **Request port 25 unblocking** — go to your server in the Hetzner console → *Networking* tab → request port 25 unblocking. Required for receiving and sending email between mail servers.

2. **Set reverse DNS (PTR record)** — in the same *Networking* tab, set the IPv4 reverse DNS entry to `mail.your-domain.com`. This prevents your outgoing mail from being marked as spam.

---

### 9. Verify mail is working

Configure a mail client (e.g. Thunderbird) with:

| Setting | Value |
|---------|-------|
| IMAP server | `mail.your-domain.com` |
| IMAP port | `993` (SSL/TLS) |
| SMTP server | `mail.your-domain.com` |
| SMTP port | `587` (STARTTLS) |
| Username | `contact@your-domain.com` |

Send a test email and verify delivery. Check logs if something fails:

```bash
docker compose logs mailserver --tail=50
```

---

### 10. CI/CD via GitHub Actions [one-time]

The included workflow (`.github/workflows/main.yml`) deploys automatically on every push to `main` via SSH. Add these secrets to your GitHub repository settings:

| Secret | Value |
|--------|-------|
| `SSH_HOST` | Your server IP |
| `SSH_PORT` | SSH port (usually `22`) |
| `SSH_USER` | SSH username (e.g. `root`) |
| `SSH_PRIVATE_KEY` | Private key that has access to the server |

---

### What survives rebuilds

| Data | Where stored | Survives `docker compose up --build` |
|------|-------------|--------------------------------------|
| PostgreSQL data | `postgres_data` Docker volume | Yes |
| Uploaded files | `uploads` Docker volume | Yes |
| Caddy TLS certs | `caddy_data` Docker volume | Yes |
| Mail data (inbox) | `mail_data` Docker volume | Yes |
| Mail account passwords | `mailserver-config/postfix-accounts.cf` (bind mount, gitignored) | Yes |
| DKIM private keys | `mailserver-config/opendkim/` (bind mount, gitignored) | Yes |
| Sieve rules (auto-reply, forwarding) | `mailserver-config/sieve/` (bind mount, **in git**) | Yes |
| `.env` secrets | Manually created, gitignored | Yes (stays on disk) |

On a **brand new server**, the only steps that need repeating are **6, 7, and 8** — add the mail account, regenerate DKIM keys, and update the DNS DKIM record.

---

## License

MIT

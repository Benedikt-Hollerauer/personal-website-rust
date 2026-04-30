# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_LINK_GITHUB
ARG VITE_LINK_INSTAGRAM
ARG VITE_LINK_LINKEDIN
ARG VITE_LINK_LINKEDIN_SKILLS
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY \
    VITE_LINK_GITHUB=$VITE_LINK_GITHUB \
    VITE_LINK_INSTAGRAM=$VITE_LINK_INSTAGRAM \
    VITE_LINK_LINKEDIN=$VITE_LINK_LINKEDIN \
    VITE_LINK_LINKEDIN_SKILLS=$VITE_LINK_LINKEDIN_SKILLS
RUN npm run build

# ── Stage 2: serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
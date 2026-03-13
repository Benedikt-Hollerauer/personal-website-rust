FROM rust:1.88.0-slim AS builder

WORKDIR /usr/src/
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app
COPY --from=builder /usr/src/config config
COPY --from=builder /usr/src/target/release/backend-cli backend-cli
RUN mkdir -p uploads

ENV LOCO_ENV=production
EXPOSE 5150
ENTRYPOINT ["/usr/app/backend-cli", "start"]
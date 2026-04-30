FROM rust:1.88.0-slim AS chef
RUN cargo install cargo-chef --locked
WORKDIR /usr/src/

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /usr/src/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
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

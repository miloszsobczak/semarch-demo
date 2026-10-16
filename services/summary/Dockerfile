FROM rust:1-slim-bookworm AS build
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo test --locked && cargo build --release --locked

FROM debian:bookworm-slim
COPY --from=build /src/target/release/ticket-summary /usr/local/bin/ticket-summary
USER nobody
EXPOSE 8082
CMD ["ticket-summary"]

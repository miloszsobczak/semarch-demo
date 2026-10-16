# semarch-demo

A small, public TypeScript, Go and Rust system for exploring [semarch](https://semarch.dev). It has an API, a web client, a worker, a Go notifier, a Rust summary service, and a shared ticket contract. Changes that cross those boundaries make useful architecture diffs.

## Run it

```sh
npm install
npm run check
npm test
npm start
(cd services/notifier && go test ./...)
(cd services/summary && cargo test --locked)
curl -X POST http://localhost:3000/tickets -H 'content-type: application/json' -d '{"subject":"Cannot sign in"}'
curl http://localhost:3000/tickets
```

The API stores tickets in memory and resets on restart. The web package is a browser module, while the worker can run as an event consumer through Compose. Both show how a contract change reaches consumers. This is example code, not a production help desk.

## Run the system map

```sh
docker compose up --build
```

Compose starts the API, an escalation worker, the Go notifier, the Rust summary service, and Redis. Create a ticket through the API, then `POST /tickets/<id>/escalate`. The API publishes an event to Redis and the worker logs an updated digest. Run `docker compose logs -f worker` to watch it. The notifier receives the same event, reads the tickets from the API and raises an alert: `curl http://localhost:8080/alerts`. The Rust service reads the TypeScript API and combines them with the Go notifier’s alerts and returns counts at `curl http://localhost:8082/summary` (total, open, urgent-open and alerts). Its listener is configured with `SUMMARY_ADDR`; the API address is the literal Compose URL `http://api:3000/tickets`, so this cross-language contract is visible in the atlas.

The API remains in-memory and Redis Pub/Sub does not retain events; this is a small architecture example.

The escalation example adds `priority` to the shared ticket contract, an API endpoint, a browser action, and an urgent count in the worker digest. Try creating a ticket, then `POST /tickets/<id>/escalate` to make it urgent.

## Playground

Open a pull request that changes an API, contract, or client. The [semarch GitHub App](https://github.com/apps/semarch-app/installations/new) can comment with a diff and an interactive map. Start with [the escalation example](https://github.com/miloszsobczak/semarch-demo/pulls), then try a new branch for another experiment. Keep the example PR open so its report remains stable on [semarch.dev](https://semarch.dev/demo.html).

The repository is intentionally public and contains no credentials or customer data. Issues and PRs can be used to try changes to the scanner and its visual presentation.

## Layout

| Path | Purpose |
| --- | --- |
| `packages/contracts` | Ticket types and validation |
| `packages/api` | HTTP routes, service, in-memory store |
| `packages/web` | Browser client and ticket rendering |
| `packages/worker` | Ticket digest and Redis event consumer |
| `services/notifier` | Go service: Redis subscriber, API client, `GET /alerts` |
| `services/summary` | Rust/axum service: API and notifier clients, ticket/alert counts, `GET /summary` |
| `compose.yml` | API, worker, notifier, summary, Redis and their runtime connections |

MIT licensed. See [LICENSE](LICENSE).

## Scan the Rust example locally

With semarch checked out next to this repository and its dependencies installed:

```sh
cd ../semarch
pnpm semarch scan "$PWD/eval/flows/semarch-demo.workspace.json"
pnpm semarch serve "$PWD/eval/flows/semarch-demo.workspace.json"
```

That workspace configures the TypeScript, Go and Rust extractors. The atlas shows summary as a Compose service, its Rust declarations, `GET /summary`, and its consumption of the API's `GET /tickets` contract and the Go notifier's `GET /alerts`. The latter resolves to the Go handler and forms a cross-language flow. Rust extraction needs Node.js, not Cargo; Cargo is required only to build/test the service. Use Compose to run the example so its internal `api` hostname resolves.

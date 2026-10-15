# semarch-demo

A small, public TypeScript and Go system for exploring [semarch](https://semarch.dev). It has an API, a web client, a worker, a Go notifier, and a shared ticket contract. Changes that cross those boundaries make useful architecture diffs.

## Run it

```sh
npm install
npm run check
npm test
npm start
(cd services/notifier && go test ./...)
curl -X POST http://localhost:3000/tickets -H 'content-type: application/json' -d '{"subject":"Cannot sign in"}'
curl http://localhost:3000/tickets
```

The API stores tickets in memory and resets on restart. The web package is a browser module, while the worker can run as an event consumer through Compose. Both show how a contract change reaches consumers. This is example code, not a production help desk.

## Run the system map

```sh
docker compose up --build
```

Compose starts the API, an escalation worker, the Go notifier, and Redis. Create a ticket through the API, then `POST /tickets/<id>/escalate`. The API publishes an event to Redis and the worker logs an updated digest. Run `docker compose logs -f worker` to watch it. The notifier receives the same event, reads the tickets from the API and raises an alert: `curl http://localhost:8080/alerts`. The API remains in-memory and Redis Pub/Sub does not retain events; this is a small architecture example.

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
| `compose.yml` | API, worker, notifier, Redis and their runtime connections |

MIT licensed. See [LICENSE](LICENSE).

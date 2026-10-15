# semarch-demo

A small, public TypeScript system for exploring [semarch](https://semarch.dev). It has an API, a web client, a worker, and a shared ticket contract. Changes that cross those boundaries make useful architecture diffs.

## Run it

```sh
npm install
npm run check
npm test
npm start
curl -X POST http://localhost:3000/tickets -H 'content-type: application/json' -d '{"subject":"Cannot sign in"}'
curl http://localhost:3000/tickets
```

The API stores tickets in memory and resets on restart. The web and worker packages are small reusable modules; they are here to show how a contract change reaches consumers. This is example code, not a production help desk.

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
| `packages/worker` | Ticket digest |

MIT licensed. See [LICENSE](LICENSE).

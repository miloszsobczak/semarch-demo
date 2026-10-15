import { createServer } from 'node:http';
import { TicketService } from './service.js';
import { TicketStore } from './store.js';
import { publishEscalation } from './events.js';

const service = new TicketService(new TicketStore());
const server = createServer(async (request, response) => {
  response.setHeader('content-type', 'application/json');
  if (request.method === 'GET' && request.url === '/tickets') {
    response.end(JSON.stringify(service.list()));
    return;
  }
  if (request.method === 'POST' && request.url === '/tickets') {
    try {
      let body = '';
      for await (const chunk of request) body += chunk;
      const input = JSON.parse(body);
      const ticket = service.create(input.subject, input.priority);
      response.writeHead(201).end(JSON.stringify(ticket));
    } catch {
      response.writeHead(400).end(JSON.stringify({ error: 'Invalid ticket' }));
    }
    return;
  }
  const resolve = request.url?.match(/^\/tickets\/([^/]+)\/resolve$/);
  if (request.method === 'POST' && resolve) {
    const ticket = service.resolve(resolve[1]);
    response.writeHead(ticket ? 200 : 404).end(JSON.stringify(ticket ?? { error: 'Not found' }));
    return;
  }
  const escalate = request.url?.match(/^\/tickets\/([^/]+)\/escalate$/);
  if (request.method === 'POST' && escalate) {
    const ticket = service.escalate(escalate[1]);
    if (ticket) void publishEscalation(ticket).catch((error) => console.error('Escalation event:', error));
    response.writeHead(ticket ? 200 : 404).end(JSON.stringify(ticket ?? { error: 'Not found' }));
    return;
  }
  response.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
});

server.listen(Number(process.env.PORT ?? 3000), () => console.log('Demo API listening on port 3000'));

import { createClient } from 'redis';
import type { Ticket } from '@demo/contracts';
import { summarizeTickets } from './digest.js';

const client = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
const api = process.env.API_URL ?? 'http://localhost:3000';
client.on('error', (error) => console.error('Redis subscriber:', error));

await client.connect();
await client.subscribe('tickets.escalated', async (message) => {
  try {
    const response = await fetch(`${api}/tickets`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const tickets = await response.json() as Ticket[];
    console.log('Escalation', JSON.parse(message), summarizeTickets(tickets));
  } catch (error) {
    console.error('Could not refresh ticket digest:', error);
  }
});
console.log('Listening for ticket escalations');

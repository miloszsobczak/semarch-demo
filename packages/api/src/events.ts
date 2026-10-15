import { createClient } from 'redis';
import type { Ticket } from '@demo/contracts';

// Local npm start works without Redis; Compose supplies REDIS_URL for the full system.
export async function publishEscalation(ticket: Ticket): Promise<void> {
  const url = process.env.REDIS_URL;
  if (!url) return;
  const client = createClient({ url });
  client.on('error', (error) => console.error('Redis publisher:', error));
  try {
    await client.connect();
    await client.publish('tickets.escalated', JSON.stringify({ id: ticket.id, subject: ticket.subject }));
  } finally {
    if (client.isOpen) await client.quit();
  }
}

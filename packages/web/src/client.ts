import type { Alert, Ticket } from '@demo/contracts';

const endpoint = 'http://localhost:3000';
const notifier = 'http://localhost:8080';

export async function listTickets(): Promise<Ticket[]> {
  const response = await fetch(`${endpoint}/tickets`);
  if (!response.ok) throw new Error('Could not load tickets');
  return response.json() as Promise<Ticket[]>;
}

export async function createTicket(subject: string): Promise<Ticket> {
  const response = await fetch(`${endpoint}/tickets`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ subject }),
  });
  if (!response.ok) throw new Error('Could not create ticket');
  return response.json() as Promise<Ticket>;
}

export async function escalateTicket(id: string): Promise<Ticket> {
  const response = await fetch(`${endpoint}/tickets/${id}/escalate`, { method: 'POST' });
  if (!response.ok) throw new Error('Could not escalate ticket');
  return response.json() as Promise<Ticket>;
}

export async function listAlerts(): Promise<Alert[]> {
  const response = await fetch(`${notifier}/alerts`);
  if (!response.ok) throw new Error('Could not load alerts');
  return response.json() as Promise<Alert[]>;
}

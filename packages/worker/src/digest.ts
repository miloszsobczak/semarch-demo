import type { Ticket } from '@demo/contracts';

export interface TicketDigest {
  total: number;
  open: number;
  resolved: number;
}

export function summarizeTickets(tickets: Ticket[]): TicketDigest {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
  };
}

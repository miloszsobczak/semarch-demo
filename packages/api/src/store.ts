import type { Ticket } from '@demo/contracts';

export class TicketStore {
  private readonly tickets = new Map<string, Ticket>();

  save(ticket: Ticket): Ticket {
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  all(): Ticket[] {
    return [...this.tickets.values()];
  }

  find(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }
}

import type { Ticket } from '@demo/contracts';

export function ticketLabel(ticket: Ticket): string {
  return `${ticket.subject} · ${ticket.status}${ticket.priority === 'urgent' ? ' · urgent' : ''}`;
}

export function renderTickets(tickets: Ticket[], target: HTMLElement): void {
  target.replaceChildren(...tickets.map((ticket) => {
    const item = document.createElement('li');
    item.textContent = ticketLabel(ticket);
    return item;
  }));
}

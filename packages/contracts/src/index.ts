export type TicketStatus = 'open' | 'resolved';

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
}

export interface CreateTicket {
  subject: string;
}

export function validSubject(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 120;
}

export type TicketStatus = 'open' | 'resolved';
export type TicketPriority = 'normal' | 'urgent';

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
}

export interface CreateTicket {
  subject: string;
  priority?: TicketPriority;
}

export function validSubject(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 120;
}

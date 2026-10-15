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

/** An alert the Go notifier raises when a ticket is escalated. */
export interface Alert {
  ticketId: string;
  subject: string;
  urgentOpen: number;
  raisedAt: string;
}

export function validSubject(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 120;
}

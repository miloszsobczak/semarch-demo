import { randomUUID } from 'node:crypto';
import { validSubject, type Ticket, type TicketPriority } from '@demo/contracts';
import { TicketStore } from './store.js';

export class TicketService {
  constructor(private readonly store: TicketStore) {}

  create(subject: unknown, priority: TicketPriority = 'normal'): Ticket {
    if (!validSubject(subject)) throw new Error('Subject must be 1–120 characters');
    if (priority !== 'normal' && priority !== 'urgent') throw new Error('Invalid priority');
    return this.store.save({ id: randomUUID(), subject: subject.trim(), status: 'open', priority, createdAt: new Date().toISOString() });
  }

  list(): Ticket[] {
    return this.store.all();
  }

  resolve(id: string): Ticket | undefined {
    const ticket = this.store.find(id);
    if (!ticket) return undefined;
    return this.store.save({ ...ticket, status: 'resolved' });
  }

  escalate(id: string): Ticket | undefined {
    const ticket = this.store.find(id);
    if (!ticket || ticket.status === 'resolved') return undefined;
    return this.store.save({ ...ticket, priority: 'urgent' });
  }
}

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TicketService } from '../dist/service.js';
import { TicketStore } from '../dist/store.js';
import { summarizeTickets } from '../../worker/dist/digest.js';

test('escalation updates the shared ticket and the worker digest', () => {
  const service = new TicketService(new TicketStore());
  const ticket = service.create('Cannot sign in');
  assert.equal(ticket.priority, 'normal');
  assert.equal(service.escalate(ticket.id)?.priority, 'urgent');
  assert.deepEqual(summarizeTickets(service.list()), { total: 1, open: 1, resolved: 0, urgent: 1 });
  service.resolve(ticket.id);
  assert.equal(service.escalate(ticket.id), undefined);
  assert.equal(summarizeTickets(service.list()).urgent, 0);
});

test('creation rejects unknown priority', () => {
  const service = new TicketService(new TicketStore());
  assert.throws(() => service.create('Example', 'critical'), /Invalid priority/);
});

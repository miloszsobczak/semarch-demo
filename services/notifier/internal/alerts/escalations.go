package alerts

import (
	"context"
	"time"

	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/tickets"
)

// Escalation is the event the API publishes when a ticket becomes urgent.
type Escalation struct {
	ID      string `json:"id"`
	Subject string `json:"subject"`
}

// TicketSource lists the current tickets.
type TicketSource interface {
	List(ctx context.Context) ([]tickets.Ticket, error)
}

// Escalations raises an alert for every escalation.
type Escalations struct {
	tickets TicketSource
	store   Store
	now     func() time.Time
}

func NewEscalations(source TicketSource, store Store) *Escalations {
	return &Escalations{tickets: source, store: store, now: time.Now}
}

func (e *Escalations) Handle(ctx context.Context, ev Escalation) error {
	list, err := e.tickets.List(ctx)
	if err != nil {
		return err
	}
	e.store.Add(Alert{TicketID: ev.ID, Subject: ev.Subject, UrgentOpen: tickets.UrgentOpen(list), RaisedAt: e.now()})
	return nil
}

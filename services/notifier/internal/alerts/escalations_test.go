package alerts

import (
	"context"
	"testing"
	"time"

	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/tickets"
)

type fixedTickets []tickets.Ticket

func (f fixedTickets) List(context.Context) ([]tickets.Ticket, error) { return f, nil }

func TestEscalationRaisesAlertWithUrgentWorkload(t *testing.T) {
	store := NewMemoryStore(2)
	e := NewEscalations(fixedTickets{
		{ID: "1", Status: "open", Priority: "urgent"},
		{ID: "2", Status: "resolved", Priority: "urgent"},
		{ID: "3", Status: "open", Priority: "normal"},
	}, store)
	at := time.Date(2026, 10, 15, 12, 0, 0, 0, time.UTC)
	e.now = func() time.Time { return at }
	for _, id := range []string{"1", "3", "1"} {
		if err := e.Handle(context.Background(), Escalation{ID: id, Subject: "Cannot sign in"}); err != nil {
			t.Fatal(err)
		}
	}
	got := store.Recent()
	if len(got) != 2 || got[0].TicketID != "1" || got[1].TicketID != "3" {
		t.Fatalf("recent alerts %+v", got)
	}
	if got[0].UrgentOpen != 1 || !got[0].RaisedAt.Equal(at) {
		t.Errorf("alert %+v", got[0])
	}
}

// Package alerts keeps the alerts raised for escalated tickets.
package alerts

import (
	"sync"
	"time"
)

// Alert is raised when a ticket is escalated, with the urgent workload at
// that moment.
type Alert struct {
	TicketID   string    `json:"ticketId"`
	Subject    string    `json:"subject"`
	UrgentOpen int       `json:"urgentOpen"`
	RaisedAt   time.Time `json:"raisedAt"`
}

// Store holds recent alerts.
type Store interface {
	Add(a Alert)
	Recent() []Alert
}

// MemoryStore keeps the last few alerts in memory; it resets on restart.
type MemoryStore struct {
	mu    sync.Mutex
	limit int
	items []Alert
}

func NewMemoryStore(limit int) *MemoryStore { return &MemoryStore{limit: limit} }

func (m *MemoryStore) Add(a Alert) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items = append(m.items, a)
	if len(m.items) > m.limit {
		m.items = m.items[len(m.items)-m.limit:]
	}
}

// Recent lists alerts, newest first.
func (m *MemoryStore) Recent() []Alert {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := make([]Alert, len(m.items))
	for i, a := range m.items {
		out[len(m.items)-1-i] = a
	}
	return out
}

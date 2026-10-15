// Package events receives the API's ticket events from Redis Pub/Sub.
package events

import (
	"context"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"

	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/alerts"
)

type Subscriber struct {
	rdb *redis.Client
}

func NewSubscriber(url string) (*Subscriber, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	return &Subscriber{rdb: redis.NewClient(opts)}, nil
}

// Run handles escalations until the context ends. Pub/Sub keeps no history:
// events published while the notifier is down are lost.
func (s *Subscriber) Run(ctx context.Context, handle func(context.Context, alerts.Escalation) error) error {
	sub := s.rdb.Subscribe(ctx, "tickets.escalated")
	defer sub.Close()
	for {
		msg, err := sub.ReceiveMessage(ctx)
		if err != nil {
			return err
		}
		var ev alerts.Escalation
		if err := json.Unmarshal([]byte(msg.Payload), &ev); err != nil {
			log.Printf("ignoring malformed escalation: %v", err)
			continue
		}
		if err := handle(ctx, ev); err != nil {
			log.Printf("escalation %s: %v", ev.ID, err)
		}
	}
}

func (s *Subscriber) Close() error { return s.rdb.Close() }

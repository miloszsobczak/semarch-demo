// Command notifier turns ticket escalations into alerts: it listens for the
// API's Redis events, reads the current tickets from the API and serves the
// recent alerts over HTTP.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/alerts"
	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/events"
	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/httpapi"
	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/tickets"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	store := alerts.NewMemoryStore(50)
	escalations := alerts.NewEscalations(tickets.NewClient(env("API_URL", "http://localhost:3000")), store)

	subscriber, err := events.NewSubscriber(env("REDIS_URL", "redis://localhost:6379"))
	if err != nil {
		log.Fatalf("redis: %v", err)
	}
	defer subscriber.Close()
	go func() {
		if err := subscriber.Run(ctx, escalations.Handle); err != nil && ctx.Err() == nil {
			log.Printf("escalation events: %v", err)
		}
	}()

	addr := ":" + env("PORT", "8080")
	server := &http.Server{Addr: addr, Handler: httpapi.NewServer(store)}
	go func() {
		<-ctx.Done()
		_ = server.Close()
	}()
	log.Printf("notifier listening on %s", addr)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func env(name, fallback string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return fallback
}

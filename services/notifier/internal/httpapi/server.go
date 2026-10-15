// Package httpapi serves the notifier's alerts.
package httpapi

import (
	"encoding/json"
	"net/http"

	"github.com/miloszsobczak/semarch-demo/services/notifier/internal/alerts"
)

type server struct {
	store alerts.Store
}

func NewServer(store alerts.Store) http.Handler {
	s := &server{store: store}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /alerts", s.alerts)
	mux.HandleFunc("GET /healthz", s.health)
	return mux
}

func (s *server) alerts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-type", "application/json")
	_ = json.NewEncoder(w).Encode(s.store.Recent())
}

func (s *server) health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

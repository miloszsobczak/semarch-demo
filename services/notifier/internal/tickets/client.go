// Package tickets reads tickets from the demo API.
package tickets

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Ticket mirrors the shared contract in packages/contracts.
type Ticket struct {
	ID       string `json:"id"`
	Subject  string `json:"subject"`
	Status   string `json:"status"`
	Priority string `json:"priority"`
}

// Client calls the API's ticket endpoints.
type Client struct {
	base string
	http *http.Client
}

func NewClient(base string) *Client {
	return &Client{base: base, http: &http.Client{Timeout: 5 * time.Second}}
}

func (c *Client) List(ctx context.Context) ([]Ticket, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.base+"/tickets", nil)
	if err != nil {
		return nil, err
	}
	res, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned %s", res.Status)
	}
	var out []Ticket
	return out, json.NewDecoder(res.Body).Decode(&out)
}

// UrgentOpen counts open tickets marked urgent.
func UrgentOpen(list []Ticket) int {
	n := 0
	for _, t := range list {
		if t.Status == "open" && t.Priority == "urgent" {
			n++
		}
	}
	return n
}

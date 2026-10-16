package dev.semarch.triage;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

/** Reads the TypeScript API over the same HTTP contract used by the Go and Rust services. */
@Component
public class TicketClient {
    private final RestClient http;

    public TicketClient(RestClient http) {
        this.http = http;
    }

    public Ticket[] list() {
        try {
            Ticket[] tickets = http.get().uri("http://api:3000/tickets").retrieve().body(Ticket[].class);
            if (tickets == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Ticket API returned no payload");
            return tickets;
        } catch (RestClientException error) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Ticket API unavailable", error);
        }
    }
}

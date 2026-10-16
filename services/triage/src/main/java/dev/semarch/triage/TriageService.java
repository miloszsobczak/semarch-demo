package dev.semarch.triage;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/** Builds the open queue with urgent tickets first and stable ID ordering within each priority. */
@Service
public class TriageService {
    private final TicketClient tickets;

    public TriageService(TicketClient tickets) {
        this.tickets = tickets;
    }

    public List<Ticket> queue() {
        return Arrays.stream(tickets.list())
            .filter(ticket -> "open".equals(ticket.status()))
            .sorted(Comparator.comparing((Ticket ticket) -> !"urgent".equals(ticket.priority()))
                .thenComparing(Ticket::id))
            .toList();
    }
}

package dev.semarch.triage;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exposes the triage queue for the current API tickets. */
@RestController
public class TriageController {
    private final TriageService triage;

    public TriageController(TriageService triage) {
        this.triage = triage;
    }

    @GetMapping("/triage")
    public List<Ticket> queue() {
        return triage.queue();
    }
}

package dev.semarch.triage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestClient;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TriageTest {
    private MockRestServiceServer upstream;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        upstream = MockRestServiceServer.bindTo(builder).build();
        mvc = MockMvcBuilders.standaloneSetup(new TriageController(new TriageService(new TicketClient(builder.build())))).build();
    }

    @Test
    void returnsOpenTicketsWithUrgentFirstAndStableIdOrder() throws Exception {
        upstream.expect(requestTo("http://api:3000/tickets")).andRespond(withSuccess("""
            [{"id":"3","subject":"Normal","status":"open","priority":"normal"},
             {"id":"2","subject":"Urgent B","status":"open","priority":"urgent"},
             {"id":"1","subject":"Urgent A","status":"open","priority":"urgent"},
             {"id":"4","subject":"Done","status":"resolved","priority":"urgent"}]
            """, MediaType.APPLICATION_JSON));
        mvc.perform(get("/triage")).andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].id").value("1"))
            .andExpect(jsonPath("$[1].id").value("2"))
            .andExpect(jsonPath("$[2].id").value("3"));
        upstream.verify();
    }

    @Test
    void returnsEmptyQueueWhenNoTicketsExist() throws Exception {
        upstream.expect(requestTo("http://api:3000/tickets")).andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));
        mvc.perform(get("/triage")).andExpect(status().isOk()).andExpect(content().json("[]"));
        upstream.verify();
    }

    @Test
    void reportsUpstreamFailureAsBadGateway() throws Exception {
        upstream.expect(requestTo("http://api:3000/tickets")).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        mvc.perform(get("/triage")).andExpect(status().isBadGateway());
        upstream.verify();
    }

    @Test
    void reportsMalformedUpstreamPayloadAsBadGateway() throws Exception {
        upstream.expect(requestTo("http://api:3000/tickets")).andRespond(withSuccess("invalid JSON", MediaType.APPLICATION_JSON));
        mvc.perform(get("/triage")).andExpect(status().isBadGateway());
        upstream.verify();
    }
}

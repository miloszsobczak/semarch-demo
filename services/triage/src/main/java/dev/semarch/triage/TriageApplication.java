package dev.semarch.triage;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@SpringBootApplication
public class TriageApplication {
    public static void main(String[] args) {
        String port = System.getenv("TRIAGE_PORT");
        SpringApplication app = new SpringApplication(TriageApplication.class);
        app.setDefaultProperties(Map.of("server.port", port == null ? "8083" : port));
        app.run(args);
    }

    @Bean
    RestClient ticketHttp() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(3000);
        return RestClient.builder().requestFactory(factory).build();
    }
}

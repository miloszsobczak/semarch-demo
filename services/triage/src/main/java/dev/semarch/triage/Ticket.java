package dev.semarch.triage;

/** Ticket returned by the shared TypeScript API contract. */
public record Ticket(String id, String subject, String status, String priority) {}

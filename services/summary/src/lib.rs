use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Ticket {
    pub status: String,
    pub priority: String,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct Summary {
    pub total: usize,
    pub open: usize,
    pub urgent: usize,
    pub alerts: usize,
}

pub fn summarize(tickets: &[Ticket], alerts: usize) -> Summary {
    Summary {
        total: tickets.len(),
        alerts,
        open: tickets.iter().filter(|t| t.status == "open").count(),
        urgent: tickets
            .iter()
            .filter(|t| t.status == "open" && t.priority == "urgent")
            .count(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn summarizes_tickets_from_the_shared_api_contract() {
        let tickets = vec![
            Ticket {
                status: "open".into(),
                priority: "urgent".into(),
            },
            Ticket {
                status: "resolved".into(),
                priority: "normal".into(),
            },
            Ticket {
                status: "open".into(),
                priority: "normal".into(),
            },
        ];
        assert_eq!(
            summarize(&tickets, 2),
            Summary {
                alerts: 2,
                total: 3,
                open: 2,
                urgent: 1
            }
        );
    }

    #[test]
    fn handles_an_empty_queue() {
        assert_eq!(
            summarize(&[], 0),
            Summary {
                alerts: 0,
                total: 0,
                open: 0,
                urgent: 0
            }
        );
    }
}

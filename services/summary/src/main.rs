use axum::{http::StatusCode, routing::get, Json, Router};
use ticket_summary::{summarize, Summary, Ticket};

// The literal Compose address makes the Rust -> TypeScript contract visible in the atlas.
async fn tickets() -> Result<Vec<Ticket>, reqwest::Error> {
    reqwest::get("http://api:3000/tickets")
        .await?
        .error_for_status()?
        .json()
        .await
}

async fn alert_count() -> Result<usize, reqwest::Error> {
    // Count the Go notifier's alerts without depending on its payload fields.
    let alerts: Vec<serde::de::IgnoredAny> = reqwest::get("http://notifier:8080/alerts")
        .await?
        .error_for_status()?
        .json()
        .await?;
    Ok(alerts.len())
}

async fn summary() -> Result<Json<Summary>, (StatusCode, &'static str)> {
    let tickets = tickets()
        .await
        .map_err(|_| (StatusCode::BAD_GATEWAY, "ticket API unavailable"))?;
    let alerts = alert_count()
        .await
        .map_err(|_| (StatusCode::BAD_GATEWAY, "notifier unavailable"))?;
    Ok(Json(summarize(&tickets, alerts)))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let address = std::env::var("SUMMARY_ADDR").unwrap_or_else(|_| "0.0.0.0:8082".into());
    let listener = tokio::net::TcpListener::bind(&address).await?;
    let app = Router::new().route("/summary", get(summary));
    axum::serve(listener, app).await?;
    Ok(())
}

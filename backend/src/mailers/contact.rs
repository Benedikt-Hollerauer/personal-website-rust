#![allow(non_upper_case_globals)]

use loco_rs::prelude::*;
use serde_json::json;

static welcome: Dir<'_> = include_dir!("src/mailers/contact/welcome");
static autoreply: Dir<'_> = include_dir!("src/mailers/contact/autoreply");

fn site_url() -> String {
    std::env::var("APP_HOST")
        .ok()
        .filter(|v| !v.is_empty() && !v.contains("localhost") && !v.contains("127.0.0.1"))
        .unwrap_or_else(|| "https://benedikt-hollerauer.com".to_string())
}

#[allow(clippy::module_name_repetitions)]
pub struct Contact {}
impl Mailer for Contact {}
impl Contact {
    pub async fn send_contact(ctx: &AppContext, name: &str, sender_email: &str, message: &str) -> Result<()> {
        Self::mail_template(
            ctx,
            &welcome,
            mailer::Args {
                from: Some("contact@benedikt-hollerauer.com".to_string()),
                to: "contact@benedikt-hollerauer.com".to_string(),
                locals: json!({
                  "name": name,
                  "email": sender_email,
                  "message": message,
                  "domain": site_url()
                }),
                ..Default::default()
            },
        ).await?;
        Ok(())
    }

    pub async fn send_autoreply(ctx: &AppContext, name: &str, recipient_email: &str) -> Result<()> {
        Self::mail_template(
            ctx,
            &autoreply,
            mailer::Args {
                from: Some("contact@benedikt-hollerauer.com".to_string()),
                to: recipient_email.to_string(),
                locals: json!({
                  "name": name,
                  "domain": site_url()
                }),
                ..Default::default()
            },
        ).await?;
        Ok(())
    }
}

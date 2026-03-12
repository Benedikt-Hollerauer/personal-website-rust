#![allow(non_upper_case_globals)]

use loco_rs::prelude::*;
use serde_json::json;

static welcome: Dir<'_> = include_dir!("src/mailers/contact/welcome");

#[allow(clippy::module_name_repetitions)]
pub struct Contact {}
impl Mailer for Contact {}
impl Contact {
    /// Send an email
    ///
    /// # Errors
    /// When email sending is failed
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
                  "domain": ctx.config.server.full_url()
                }),
                ..Default::default()
            },
        ).await?;

        Ok(())
    }
}

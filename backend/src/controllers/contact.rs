#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::Deserialize;
use crate::mailers::contact::Contact;

#[derive(Deserialize)]
pub struct ContactParams {
    pub name: String,
    pub email: String,
    pub message: String,
    #[serde(rename = "captchaToken")]
    pub captcha_token: String,
}

#[derive(Debug, Deserialize)]
struct RecaptchaVerifyResponse {
    success: bool,
    #[serde(default)]
    #[serde(rename = "error-codes")]
    error_codes: Option<Vec<String>>,
}

fn to_loco_error<E>(err: E) -> Error
where
    E: std::error::Error + Send + Sync + 'static,
{
    Error::from(Box::new(err) as Box<dyn std::error::Error + Send + Sync>)
}

async fn verify_recaptcha(secret: &str, token: &str) -> Result<RecaptchaVerifyResponse> {
    let client = reqwest::Client::new();

    let sent = client
        .post("https://www.google.com/recaptcha/api/siteverify")
        .form(&[("secret", secret), ("response", token)])
        .send()
        .await
        .map_err(to_loco_error)?;

    let ok = sent.error_for_status().map_err(to_loco_error)?;

    let parsed = ok
        .json::<RecaptchaVerifyResponse>()
        .await
        .map_err(to_loco_error)?;

    Ok(parsed)
}

#[debug_handler]
pub async fn send(State(ctx): State<AppContext>, Json(params): Json<ContactParams>) -> Result<Response> {
    if params.captcha_token.trim().is_empty() {
        return bad_request("missing captcha token");
    }

    let Ok(secret) = std::env::var("RECAPTCHA_SECRET_KEY") else {
        return bad_request("missing RECAPTCHA_SECRET_KEY");
    };

    let verify = verify_recaptcha(&secret, &params.captcha_token).await?;
    if !verify.success {
        tracing::warn!(?verify.error_codes, "recaptcha verification failed");
        return bad_request("captcha verification failed");
    }

    Contact::send_contact(&ctx, &params.name, &params.email, &params.message).await?;
    format::json(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/contact/")
        .add("/", post(send))
}

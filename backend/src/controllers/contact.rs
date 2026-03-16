#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use serde::Deserialize;
use crate::mailers::contact::Contact;

const RECAPTCHA_ACTION: &str = "contact_form_submit";
const DEFAULT_RECAPTCHA_MIN_SCORE: f64 = 0.5;

#[derive(Debug, Clone, Deserialize)]
struct RecaptchaSettings {
    secret_key: Option<String>,
    min_score: Option<f64>,
}

#[derive(Debug, Clone, Deserialize)]
struct AppSettings {
    recaptcha: Option<RecaptchaSettings>,
}

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
    score: Option<f64>,
    #[serde(default)]
    action: Option<String>,
    #[serde(default)]
    #[serde(rename = "error-codes")]
    error_codes: Option<Vec<String>>,
}

fn app_settings(ctx: &AppContext) -> Option<AppSettings> {
    ctx.config
        .settings
        .clone()
        .and_then(|settings| serde_json::from_value::<AppSettings>(settings).ok())
}

fn recaptcha_secret_key(ctx: &AppContext) -> Option<String> {
    std::env::var("RECAPTCHA_SECRET_KEY")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .or_else(|| {
            app_settings(ctx)
                .and_then(|settings| settings.recaptcha)
                .and_then(|recaptcha| recaptcha.secret_key)
                .filter(|value| !value.trim().is_empty())
        })
}

fn recaptcha_min_score(ctx: &AppContext) -> f64 {
    std::env::var("RECAPTCHA_MIN_SCORE")
        .ok()
        .and_then(|value| value.parse::<f64>().ok())
        .or_else(|| {
            app_settings(ctx)
                .and_then(|settings| settings.recaptcha)
                .and_then(|recaptcha| recaptcha.min_score)
        })
        .unwrap_or(DEFAULT_RECAPTCHA_MIN_SCORE)
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

    let Some(secret) = recaptcha_secret_key(&ctx) else {
        return bad_request("missing RECAPTCHA_SECRET_KEY");
    };

    let verify = verify_recaptcha(&secret, &params.captcha_token).await?;
    if !verify.success {
        tracing::warn!(?verify.error_codes, "recaptcha verification failed");
        return bad_request("captcha verification failed");
    }

    let min_score = recaptcha_min_score(&ctx);
    let score = verify.score.unwrap_or_default();
    if score < min_score {
        tracing::warn!(score, min_score, "recaptcha score below threshold");
        return bad_request("captcha verification failed");
    }

    if verify.action.as_deref() != Some(RECAPTCHA_ACTION) {
        tracing::warn!(action = ?verify.action, "recaptcha action mismatch");
        return bad_request("captcha verification failed");
    }

    tracing::info!(score, action = ?verify.action, min_score, "recaptcha verification passed");

    Contact::send_contact(&ctx, &params.name, &params.email, &params.message).await?;
    format::json(())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/contact/")
        .add("/", post(send))
}

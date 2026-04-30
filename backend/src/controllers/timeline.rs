#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::timelines::{Entity as Timelines, ActiveModel};
use sea_orm::{ActiveModelTrait, Set};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateTimelineParams {
    pub title: String,
    pub description: String,
    pub start_date: String,
    pub end_date: Option<String>,
    pub order: Option<i32>,
    pub emoji: Option<String>,
    pub accent_color: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateTimelineParams {
    pub title: Option<String>,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub order: Option<i32>,
    pub emoji: Option<String>,
    pub accent_color: Option<String>,
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Timelines::find().all(&ctx.db).await?;
    format::json(items)
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateTimelineParams>,
) -> Result<Response> {
    let start_date = chrono::NaiveDate::parse_from_str(&params.start_date, "%Y-%m-%d")
        .map_err(|_| Error::BadRequest("Invalid start_date format, use YYYY-MM-DD".to_string()))?;
    
    let end_date = params.end_date
        .and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());

    let new_item = ActiveModel {
        title: Set(params.title),
        description: Set(params.description),
        start_date: Set(start_date),
        end_date: Set(end_date),
        order: Set(params.order.unwrap_or(0)),
        emoji: Set(params.emoji),
        accent_color: Set(params.accent_color),
        ..Default::default()
    };

    let item = new_item.insert(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn get_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let item = Timelines::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(item)
}

#[debug_handler]
pub async fn update_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateTimelineParams>,
) -> Result<Response> {
    let item = Timelines::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut active_model = item.into_active_model();
    
    if let Some(title) = params.title {
        active_model.title = Set(title);
    }
    if let Some(description) = params.description {
        active_model.description = Set(description);
    }
    if let Some(start_date) = params.start_date {
        if let Ok(date) = chrono::NaiveDate::parse_from_str(&start_date, "%Y-%m-%d") {
            active_model.start_date = Set(date);
        }
    }
    if let Some(end_date) = params.end_date {
        active_model.end_date = Set(chrono::NaiveDate::parse_from_str(&end_date, "%Y-%m-%d").ok());
    }
    if let Some(order) = params.order {
        active_model.order = Set(order);
    }
    if let Some(emoji) = params.emoji {
        active_model.emoji = Set(Some(emoji));
    }
    if let Some(accent_color) = params.accent_color {
        active_model.accent_color = Set(Some(accent_color));
    }

    let updated_item = active_model.update(&ctx.db).await?;
    format::json(updated_item)
}

#[debug_handler]
pub async fn delete_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let item = Timelines::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    item.into_active_model().delete(&ctx.db).await?;
    format::json(serde_json::json!({"success": true}))
}

#[debug_handler]
pub async fn get_work_history(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Timelines::find().all(&ctx.db).await?;
    format::json(serde_json::json!({
        "history": items,
        "timeline": items,
        "items": items
    }))
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/work-history", get(get_work_history))
        .add("/api/timeline", get(list))
        .add("/api/timeline", post(create))
        .add("/api/timeline/{id}", get(get_item))
        .add("/api/timeline/{id}", patch(update_item))
        .add("/api/timeline/{id}", delete(delete_item))
}

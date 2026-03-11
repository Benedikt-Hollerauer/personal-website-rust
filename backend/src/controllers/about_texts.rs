#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::about_texts::{Entity as AboutTexts, ActiveModel};
use sea_orm::{ActiveModelTrait, Set, ColumnTrait, EntityTrait};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateAboutTextParams {
    pub content: String,
    pub active: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateAboutTextParams {
    pub content: Option<String>,
    pub active: Option<bool>,
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = AboutTexts::find().all(&ctx.db).await?;
    format::json(items)
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateAboutTextParams>,
) -> Result<Response> {
    let active = params.active.unwrap_or(true);
    
    // If this new text is being activated, deactivate all existing ones
    if active {
        AboutTexts::update_many()
            .col_expr(crate::models::_entities::about_texts::Column::Active, sea_orm::prelude::Expr::value(false))
            .exec(&ctx.db)
            .await?;
    }
    
    let new_item = ActiveModel {
        content: Set(params.content),
        active: Set(active),
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
    let item = AboutTexts::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(item)
}

#[debug_handler]
pub async fn update_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateAboutTextParams>,
) -> Result<Response> {
    let item = AboutTexts::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut active_model = item.into_active_model();
    
    if let Some(content) = params.content {
        active_model.content = Set(content);
    }
    if let Some(active) = params.active {
        if active {
            // When activating this text, deactivate all others
            AboutTexts::update_many()
                .col_expr(crate::models::_entities::about_texts::Column::Active, sea_orm::prelude::Expr::value(false))
                .filter(crate::models::_entities::about_texts::Column::Id.ne(id))
                .exec(&ctx.db)
                .await?;
        }
        active_model.active = Set(active);
    }

    let updated_item = active_model.update(&ctx.db).await?;
    format::json(updated_item)
}

#[debug_handler]
pub async fn delete_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let item = AboutTexts::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    item.into_active_model().delete(&ctx.db).await?;
    format::json(serde_json::json!({"success": true}))
}

#[debug_handler]
pub async fn get_about(State(ctx): State<AppContext>) -> Result<Response> {
    let item = AboutTexts::find()
        .filter(crate::models::_entities::about_texts::Column::Active.eq(true))
        .one(&ctx.db)
        .await?;
    
    match item {
        Some(about) => {
            // Split the text by double newlines to create paragraphs
            let paragraphs: Vec<String> = about.content
                .split("\n\n")
                .map(|p| p.to_string())
                .collect();
            
            format::json(serde_json::json!({
                "text": about.content,
                "paragraphs": paragraphs
            }))
        },
        None => {
            // Return empty if no active about text
            format::json(serde_json::json!({
                "text": "",
                "paragraphs": []
            }))
        }
    }
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/about", get(get_about))
        .add("/api/about-texts", get(list))
        .add("/api/about-texts", post(create))
        .add("/api/about-texts/{id}", get(get_item))
        .add("/api/about-texts/{id}", patch(update_item))
        .add("/api/about-texts/{id}", delete(delete_item))
}

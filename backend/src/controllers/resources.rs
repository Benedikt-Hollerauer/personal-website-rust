#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::resources::{Entity as Resources, ActiveModel};
use sea_orm::{ActiveModelTrait, Set, ColumnTrait};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateResourceParams {
    pub title: String,
    pub description: String,
    pub resource_url: String,
    pub active: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateResourceParams {
    pub title: Option<String>,
    pub description: Option<String>,
    pub resource_url: Option<String>,
    pub active: Option<bool>,
    pub order: Option<i32>,
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Resources::find().all(&ctx.db).await?;
    format::json(items)
}

#[debug_handler]
pub async fn get_active(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Resources::find()
        .filter(crate::models::_entities::resources::Column::Active.eq(true))
        .all(&ctx.db)
        .await?;
    format::json(items)
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateResourceParams>,
) -> Result<Response> {
    let new_item = ActiveModel {
        title: Set(params.title),
        description: Set(params.description),
        resource_url: Set(params.resource_url),
        active: Set(params.active.unwrap_or(true)),
        order: Set(0),
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
    let item = Resources::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(item)
}

#[debug_handler]
pub async fn update_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateResourceParams>,
) -> Result<Response> {
    let item = Resources::find_by_id(id)
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
    if let Some(resource_url) = params.resource_url {
        active_model.resource_url = Set(resource_url);
    }
    if let Some(active) = params.active {
        active_model.active = Set(active);
    }
    if let Some(order) = params.order {
        active_model.order = Set(order);
    }

    let updated_item = active_model.update(&ctx.db).await?;
    format::json(updated_item)
}

#[debug_handler]
pub async fn delete_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let item = Resources::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    if !item.resource_url.is_empty() {
        if let Some(stripped) = item.resource_url.strip_prefix("/api/files/") {
            let fs_path = std::path::Path::new("uploads").join(stripped);
            let _ = tokio::fs::remove_file(fs_path).await;
        }
    }

    item.into_active_model().delete(&ctx.db).await?;
    format::json(serde_json::json!({"success": true}))
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/resources-public", get(get_active))
        .add("/api/resources", get(list))
        .add("/api/resources", post(create))
        .add("/api/resources/{id}", get(get_item))
        .add("/api/resources/{id}", patch(update_item))
        .add("/api/resources/{id}", delete(delete_item))
}

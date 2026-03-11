#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::skills::{Entity as Skills, ActiveModel};
use sea_orm::{ActiveModelTrait, Set, ColumnTrait, QueryFilter};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateSkillParams {
    pub name: String,
    pub icon_path: Option<String>,
    pub link: Option<String>,
    pub active: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateSkillParams {
    pub name: Option<String>,
    pub icon_path: Option<String>,
    pub link: Option<String>,
    pub active: Option<bool>,
    pub order: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub active: Option<bool>,
}

#[debug_handler]
pub async fn list(
    State(ctx): State<AppContext>,
    Query(query): Query<ListQuery>,
) -> Result<Response> {
    let mut db_query = Skills::find();
    if let Some(active) = query.active {
        db_query = db_query.filter(crate::models::_entities::skills::Column::Active.eq(active));
    }
    let items = db_query.all(&ctx.db).await?;
    format::json(items)
}

#[debug_handler]
pub async fn get_active(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Skills::find()
        .filter(crate::models::_entities::skills::Column::Active.eq(true))
        .all(&ctx.db)
        .await?;
    format::json(items)
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateSkillParams>,
) -> Result<Response> {
    let new_item = ActiveModel {
        name: Set(params.name),
        icon_path: Set(params.icon_path.unwrap_or_default()),
        link: Set(params.link.unwrap_or_default()),
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
    let item = Skills::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(item)
}

#[debug_handler]
pub async fn update_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateSkillParams>,
) -> Result<Response> {
    let item = Skills::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut active_model = item.into_active_model();
    
    if let Some(name) = params.name {
        active_model.name = Set(name);
    }
    if let Some(icon_path) = params.icon_path {
        active_model.icon_path = Set(icon_path);
    }
    if let Some(link) = params.link {
        active_model.link = Set(link);
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
    let item = Skills::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    // attempt to clean up icon file from storage if it points to our upload API
    if !item.icon_path.is_empty() {
        if let Some(stripped) = item.icon_path.strip_prefix("/api/files/") {
            let fs_path = std::path::Path::new("uploads").join(stripped);
            let _ = tokio::fs::remove_file(fs_path).await;
        }
    }

    item.into_active_model().delete(&ctx.db).await?;
    format::json(serde_json::json!({"success": true}))
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/skills-public", get(get_active))
        .add("/api/skills", get(list))
        .add("/api/skills", post(create))
        .add("/api/skills/{id}", get(get_item))
        .add("/api/skills/{id}", patch(update_item))
        .add("/api/skills/{id}", delete(delete_item))
}

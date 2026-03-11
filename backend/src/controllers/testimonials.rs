#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::testimonials::{Entity as Testimonials, ActiveModel};
use sea_orm::{ActiveModelTrait, Set, ColumnTrait, QueryFilter};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateTestimonialParams {
    pub name: String,
    pub role: String,
    pub content: String,
    pub active: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateTestimonialParams {
    pub name: Option<String>,
    pub role: Option<String>,
    pub content: Option<String>,
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
    let mut db_query = Testimonials::find();
    if let Some(active) = query.active {
        db_query = db_query.filter(crate::models::_entities::testimonials::Column::Active.eq(active));
    }
    let items = db_query.all(&ctx.db).await?;
    format::json(items)
}

#[debug_handler]
pub async fn get_active(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Testimonials::find()
        .filter(crate::models::_entities::testimonials::Column::Active.eq(true))
        .all(&ctx.db)
        .await?;
    format::json(items)
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateTestimonialParams>,
) -> Result<Response> {
    let new_item = ActiveModel {
        name: Set(params.name),
        role: Set(params.role),
        content: Set(params.content),
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
    let item = Testimonials::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(item)
}

#[debug_handler]
pub async fn update_item(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateTestimonialParams>,
) -> Result<Response> {
    let item = Testimonials::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut active_model = item.into_active_model();
    
    if let Some(name) = params.name {
        active_model.name = Set(name);
    }
    if let Some(role) = params.role {
        active_model.role = Set(role);
    }
    if let Some(content) = params.content {
        active_model.content = Set(content);
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
    let item = Testimonials::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    item.into_active_model().delete(&ctx.db).await?;
    format::json(serde_json::json!({"success": true}))
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/testimonials-public", get(get_active))
        .add("/api/testimonials", get(list))
        .add("/api/testimonials", post(create))
        .add("/api/testimonials/{id}", get(get_item))
        .add("/api/testimonials/{id}", patch(update_item))
        .add("/api/testimonials/{id}", delete(delete_item))
}

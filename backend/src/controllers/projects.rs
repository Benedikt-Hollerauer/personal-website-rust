#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::projects::{Entity as Projects, ActiveModel, Column};
use sea_orm::{ActiveModelTrait, Set, QueryOrder};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateProjectParams {
    pub title: Option<String>,
    pub description: Option<String>,
    pub link: Option<String>,
    pub location: Option<String>,
    pub key_points: Option<serde_json::Value>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub order: Option<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateProjectParams {
    pub title: Option<String>,
    pub description: Option<String>,
    pub link: Option<String>,
    pub location: Option<String>,
    pub key_points: Option<serde_json::Value>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub active: Option<bool>,
    pub order: Option<i32>,
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Projects::find()
        .order_by_asc(Column::Order)
        .all(&ctx.db)
        .await?;
    format::json(items)
}

#[debug_handler]
pub async fn get_active(State(ctx): State<AppContext>) -> Result<Response> {
    use sea_orm::ColumnTrait;
    let items = Projects::find()
        .filter(Column::Active.eq(true))
        .order_by_asc(Column::Order)
        .all(&ctx.db)
        .await?;
    format::json(items)
}

#[debug_handler]
pub async fn create(
    State(ctx): State<AppContext>,
    Json(params): Json<CreateProjectParams>,
) -> Result<Response> {
    let new_project = ActiveModel {
        title: Set(params.title),
        description: Set(params.description),
        link: Set(params.link),
        location: Set(params.location),
        key_points: Set(params.key_points),
        start_date: Set(params.start_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok())),
        end_date: Set(params.end_date.and_then(|d| chrono::NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok())),
        active: Set(true),
        order: Set(params.order.unwrap_or(0)),
        ..Default::default()
    };

    let project = new_project.insert(&ctx.db).await?;
    format::json(project)
}

#[debug_handler]
pub async fn get_project(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let project = Projects::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;
    format::json(project)
}

#[debug_handler]
pub async fn update_project(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
    Json(params): Json<UpdateProjectParams>,
) -> Result<Response> {
    let project = Projects::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    let mut active_model = project.into_active_model();
    
    if let Some(title) = params.title {
        active_model.title = Set(Some(title));
    }
    if let Some(description) = params.description {
        active_model.description = Set(Some(description));
    }
    if let Some(link) = params.link {
        active_model.link = Set(Some(link));
    }
    if let Some(location) = params.location {
        active_model.location = Set(Some(location));
    }
    if let Some(key_points) = params.key_points {
        active_model.key_points = Set(Some(key_points));
    }
    if let Some(start_date) = params.start_date {
        active_model.start_date = Set(chrono::NaiveDate::parse_from_str(&start_date, "%Y-%m-%d").ok());
    }
    if let Some(end_date) = params.end_date {
        active_model.end_date = Set(chrono::NaiveDate::parse_from_str(&end_date, "%Y-%m-%d").ok());
    }
    if let Some(active) = params.active {
        active_model.active = Set(active);
    }
    if let Some(order) = params.order {
        active_model.order = Set(order);
    }

    let updated_project = active_model.update(&ctx.db).await?;
    format::json(updated_project)
}

#[debug_handler]
pub async fn delete_project(
    State(ctx): State<AppContext>,
    Path(id): Path<i32>,
) -> Result<Response> {
    let project = Projects::find_by_id(id)
        .one(&ctx.db)
        .await?
        .ok_or_else(|| Error::NotFound)?;

    project.into_active_model().delete(&ctx.db).await?;
    format::json(serde_json::json!({"success": true}))
}

pub fn routes() -> Routes {
    Routes::new()
        .add("/api/projects-public", get(get_active))
        .add("/api/projects", get(list))
        .add("/api/projects", post(create))
        .add("/api/projects/{id}", get(get_project))
        .add("/api/projects/{id}", patch(update_project))
        .add("/api/projects/{id}", delete(delete_project))
}
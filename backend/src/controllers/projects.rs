#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;
use crate::models::_entities::projects::{Entity as Projects};

pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    let items = Projects::find().all(&ctx.db).await?;

    format::json(items)
}

#[debug_handler]
pub async fn index(State(_ctx): State<AppContext>) -> Result<Response> {
    format::json("Hello from the Loco backend!")
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/projects/")
        .add("/", get(list))
}
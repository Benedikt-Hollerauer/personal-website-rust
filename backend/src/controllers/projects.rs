#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use loco_rs::prelude::*;

#[debug_handler]
pub async fn index(State(_ctx): State<AppContext>) -> Result<Response> {
    format::json("Hello from the Loco backend!")
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api/projects/")
        .add("/", get(index))
}
use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::timelines;
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;
use serde_json::json;

async fn seed_timeline(ctx: &AppContext, title: &str, order: i32) -> timelines::Model {
    timelines::ActiveModel {
        title: Set(title.to_string()),
        description: Set("Description".to_string()),
        start_date: Set(chrono::NaiveDate::from_ymd_opt(2025, 1, 1).unwrap()),
        end_date: Set(Some(chrono::NaiveDate::from_ymd_opt(2025, 12, 31).unwrap())),
        order: Set(order),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await
    .unwrap()
}

#[tokio::test]
#[serial]
async fn can_create() {
    request::<App, _, _>(|request, _ctx| async move {
        let payload = json!({
            "title": "Senior Developer at StartUp",
            "description": "Led frontend team",
            "start_date": "2025-01-01",
            "end_date": "2025-12-31"
        });
        let res = request.post("/api/timeline").json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("title").and_then(|v| v.as_str()), Some("Senior Developer at StartUp"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_sorted_list() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_timeline(&ctx, "First", 0).await;
        let _ = seed_timeline(&ctx, "Second", 1).await;
        let _ = seed_timeline(&ctx, "Third", 2).await;
        let res = request.get("/api/timeline").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        let items = json.as_array().unwrap();
        assert_eq!(items.len(), 3);
        // Verify order
        assert_eq!(items[0].get("order").and_then(|v| v.as_i64()), Some(0));
        assert_eq!(items[1].get("order").and_then(|v| v.as_i64()), Some(1));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_update() {
    request::<App, _, _>(|request, ctx| async move {
        let item = seed_timeline(&ctx, "Original", 0).await;
        let payload = json!({"title": "Updated Title"});
        let res = request.patch(&format!("/api/timeline/{}", item.id)).json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("title").and_then(|v| v.as_str()), Some("Updated Title"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let item = seed_timeline(&ctx, "ToDelete", 0).await;
        let res = request.delete(&format!("/api/timeline/{}", item.id)).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

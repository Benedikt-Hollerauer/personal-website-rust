use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::resources;
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;
use serde_json::json;

async fn seed_resource(ctx: &AppContext, title: &str, active: bool, order: i32) -> resources::Model {
    resources::ActiveModel {
        title: Set(title.to_string()),
        description: Set("A great resource".to_string()),
        resource_url: Set("https://example.com".to_string()),
        active: Set(active),
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
            "title": "React Guide",
            "description": "Complete React tutorial",
            "resource_url": "https://react.dev",
            "active": true
        });
        let res = request.post("/api/resources").json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("title").and_then(|v| v.as_str()), Some("React Guide"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_list() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_resource(&ctx, "Resource 1", true, 0).await;
        let _ = seed_resource(&ctx, "Resource 2", true, 1).await;
        let res = request.get("/api/resources").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert!(json.as_array().unwrap().len() >= 2);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_toggle_active() {
    request::<App, _, _>(|request, ctx| async move {
        let resource = seed_resource(&ctx, "Test", true, 0).await;
        let payload = json!({"active": false});
        let res = request.patch(&format!("/api/resources/{}", resource.id)).json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("active").and_then(|v| v.as_bool()), Some(false));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let resource = seed_resource(&ctx, "ToDelete", true, 0).await;
        let res = request.delete(&format!("/api/resources/{}", resource.id)).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

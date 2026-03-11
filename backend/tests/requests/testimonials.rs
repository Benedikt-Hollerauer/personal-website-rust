use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::testimonials;
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;
use serde_json::json;

async fn seed_testimonial(ctx: &AppContext, name: &str, active: bool, order: i32) -> testimonials::Model {
    testimonials::ActiveModel {
        name: Set(name.to_string()),
        role: Set("CEO".to_string()),
        content: Set("Great work!".to_string()),
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
            "name": "John Doe",
            "role": "CEO",
            "content": "Amazing developer!",
            "active": true
        });
        let res = request.post("/api/testimonials").json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("name").and_then(|v| v.as_str()), Some("John Doe"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_list() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_testimonial(&ctx, "Client 1", true, 0).await;
        let _ = seed_testimonial(&ctx, "Client 2", true, 1).await;
        let res = request.get("/api/testimonials").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert!(json.as_array().unwrap().len() >= 2);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_active_only() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_testimonial(&ctx, "Active", true, 0).await;
        let _ = seed_testimonial(&ctx, "Inactive", false, 1).await;
        let res = request.get("/api/testimonials?active=true").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        let items = json.as_array().unwrap();
        assert!(items.iter().all(|t| t.get("active").and_then(|v| v.as_bool()) == Some(true)));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_update_order() {
    request::<App, _, _>(|request, ctx| async move {
        let testimonial = seed_testimonial(&ctx, "John", true, 0).await;
        let payload = json!({"order": 3});
        let res = request.patch(&format!("/api/testimonials/{}", testimonial.id)).json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("order").and_then(|v| v.as_i64()), Some(3));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_toggle_active() {
    request::<App, _, _>(|request, ctx| async move {
        let testimonial = seed_testimonial(&ctx, "John", true, 0).await;
        let payload = json!({"active": false});
        let res = request.patch(&format!("/api/testimonials/{}", testimonial.id)).json(&payload).await;
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
        let testimonial = seed_testimonial(&ctx, "John", true, 0).await;
        let res = request.delete(&format!("/api/testimonials/{}", testimonial.id)).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

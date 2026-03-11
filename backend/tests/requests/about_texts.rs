use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::about_texts;
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;
use serde_json::json;

async fn seed_about_text(ctx: &AppContext, content: &str, active: bool) -> about_texts::Model {
    about_texts::ActiveModel {
        content: Set(content.to_string()),
        active: Set(active),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await
    .unwrap()
}

#[tokio::test]
#[serial]
async fn can_get_empty_list() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/about-texts").await;
        let text = res.text();
        println!(" Response Status: {}", res.status_code());
        println!("Response Body: {}", text);
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&text).expect("Parse JSON");
        assert!(json.is_array());
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_create() {
    request::<App, _, _>(|request, _ctx| async move {
        let payload = json!({
            "content": "Welcome to my website",
            "active": true
        });
        let res = request.post("/api/about-texts").json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("content").and_then(|v| v.as_str()), Some("Welcome to my website"));
        assert_eq!(json.get("active").and_then(|v| v.as_bool()), Some(true));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_list() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_about_text(&ctx, "About 1", true).await;
        let _ = seed_about_text(&ctx, "About 2", false).await;
        let res = request.get("/api/about-texts").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert!(json.is_array());
        assert!(json.as_array().unwrap().len() >= 2);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_single() {
    request::<App, _, _>(|request, ctx| async move {
        let text = seed_about_text(&ctx, "Single", true).await;
        let res = request.get(&format!("/api/about-texts/{}", text.id)).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("content").and_then(|v| v.as_str()), Some("Single"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_update() {
    request::<App, _, _>(|request, ctx| async move {
        let text = seed_about_text(&ctx, "Original", true).await;
        let payload = json!({"content": "Updated"});
        let res = request.patch(&format!("/api/about-texts/{}", text.id)).json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("content").and_then(|v| v.as_str()), Some("Updated"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_toggle_active() {
    request::<App, _, _>(|request, ctx| async move {
        let text = seed_about_text(&ctx, "Test", true).await;
        let payload = json!({"active": false});
        let res = request.patch(&format!("/api/about-texts/{}", text.id)).json(&payload).await;
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
        let text = seed_about_text(&ctx, "ToDelete", true).await;
        let res = request.delete(&format!("/api/about-texts/{}", text.id)).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("success").and_then(|v| v.as_bool()), Some(true));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn test_404_on_nonexistent() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/about-texts/99999").await;
        assert_eq!(res.status_code(), 404);
    })
    .await;
}

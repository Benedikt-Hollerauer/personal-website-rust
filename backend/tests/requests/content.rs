use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::{about_texts, skills, timelines, resources, testimonials};
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;
use serde_json::json;

// ============================================================================
// ABOUT TEXTS TESTS
// ============================================================================

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
async fn about_texts_can_get_empty_list() {
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
async fn about_texts_can_create() {
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
async fn about_texts_can_get_list() {
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
async fn about_texts_can_get_single() {
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
async fn about_texts_can_update() {
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
async fn about_texts_can_toggle_active() {
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
async fn about_texts_can_delete() {
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
async fn about_texts_404_on_nonexistent() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/about-texts/99999").await;
        assert_eq!(res.status_code(), 404);
    })
    .await;
}

// ============================================================================
// SKILLS TESTS
// ============================================================================

async fn seed_skill(ctx: &AppContext, name: &str, active: bool, order: i32) -> skills::Model {
    skills::ActiveModel {
        name: Set(name.to_string()),
        icon_path: Set("/uploads/skills/react.png".to_string()),
        link: Set("https://react.dev".to_string()),
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
async fn skills_can_create() {
    request::<App, _, _>(|request, _ctx| async move {
        let payload = json!({
            "name": "React",
            "icon_path": "/uploads/skills/react.png",
            "link": "https://react.dev",
            "active": true
        });
        let res = request.post("/api/skills").json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("name").and_then(|v| v.as_str()), Some("React"));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn skills_can_get_list() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_skill(&ctx, "React", true, 0).await;
        let _ = seed_skill(&ctx, "Vue", true, 1).await;
        let res = request.get("/api/skills").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert!(json.as_array().unwrap().len() >= 2);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn skills_can_get_active_only() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_skill(&ctx, "Active", true, 0).await;
        let _ = seed_skill(&ctx, "Inactive", false, 1).await;
        let res = request.get("/api/skills?active=true").await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        let skills = json.as_array().unwrap();
        assert!(skills.iter().all(|s| s.get("active").and_then(|v| v.as_bool()) == Some(true)));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn skills_can_update_order() {
    request::<App, _, _>(|request, ctx| async move {
        let skill = seed_skill(&ctx, "React", true, 0).await;
        let payload = json!({"order": 5});
        let res = request.patch(&format!("/api/skills/{}", skill.id)).json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("order").and_then(|v| v.as_i64()), Some(5));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn skills_can_toggle_active() {
    request::<App, _, _>(|request, ctx| async move {
        let skill = seed_skill(&ctx, "React", true, 0).await;
        let payload = json!({"active": false});
        let res = request.patch(&format!("/api/skills/{}", skill.id)).json(&payload).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("active").and_then(|v| v.as_bool()), Some(false));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn skills_can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let skill = seed_skill(&ctx, "React", true, 0).await;
        let res = request.delete(&format!("/api/skills/{}", skill.id)).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("success").and_then(|v| v.as_bool()), Some(true));
    })
    .await;
}

// ============================================================================
// TIMELINE TESTS
// ============================================================================

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
async fn timeline_can_create() {
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
async fn timeline_can_get_sorted_list() {
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
async fn timeline_can_update() {
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
async fn timeline_can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let item = seed_timeline(&ctx, "ToDelete", 0).await;
        let res = request.delete(&format!("/api/timeline/{}", item.id)).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

// ============================================================================
// RESOURCES TESTS
// ============================================================================

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
async fn resources_can_create() {
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
async fn resources_can_get_list() {
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
async fn resources_can_toggle_active() {
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
async fn resources_can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let resource = seed_resource(&ctx, "ToDelete", true, 0).await;
        let res = request.delete(&format!("/api/resources/{}", resource.id)).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

#[tokio::test]
#[serial]
async fn delete_resource_also_removes_file() {
    request::<App, _, _>(|request, ctx| async move {
        // create dummy file on disk
        let path = std::path::Path::new("uploads/resources/test.pdf");
        tokio::fs::create_dir_all(path.parent().unwrap()).await.unwrap();
        tokio::fs::write(path, b"dummy").await.unwrap();

        // insert resource referring to uploaded file
        let resource = resources::ActiveModel {
            title: Set("WithFile".to_string()),
            description: Set("desc".to_string()),
            resource_url: Set("/api/files/resources/test.pdf".to_string()),
            active: Set(true),
            order: Set(0),
            ..Default::default()
        }
        .insert(&ctx.db)
        .await
        .unwrap();

        let res = request.delete(&format!("/api/resources/{}", resource.id)).await;
        assert_eq!(res.status_code(), 200);
        assert!(!path.exists());
    })
    .await;
}

// ============================================================================
// TESTIMONIALS TESTS
// ============================================================================

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
async fn testimonials_can_create() {
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
async fn testimonials_can_get_list() {
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
async fn testimonials_can_get_active_only() {
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
async fn testimonials_can_update_order() {
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
async fn testimonials_can_toggle_active() {
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
async fn testimonials_can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let testimonial = seed_testimonial(&ctx, "John", true, 0).await;
        let res = request.delete(&format!("/api/testimonials/{}", testimonial.id)).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}

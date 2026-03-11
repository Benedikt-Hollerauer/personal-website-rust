use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::skills;
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;
use serde_json::json;

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
async fn can_create() {
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
async fn can_get_list() {
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
async fn can_get_active_only() {
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
async fn can_update_order() {
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
async fn can_toggle_active() {
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
async fn can_delete() {
    request::<App, _, _>(|request, ctx| async move {
        let skill = seed_skill(&ctx, "React", true, 0).await;
        let res = request.delete(&format!("/api/skills/{}", skill.id)).await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        assert_eq!(json.get("success").and_then(|v| v.as_bool()), Some(true));
    })
    .await;
}

#[tokio::test]
#[serial]
async fn delete_skill_also_removes_icon_file() {
    request::<App, _, _>(|request, ctx| async move {
        // create dummy file on disk matching upload URL
        let path = std::path::Path::new("uploads/skills/test.png");
        tokio::fs::create_dir_all(path.parent().unwrap()).await.unwrap();
        tokio::fs::write(path, b"dummy").await.unwrap();

        // insert a skill record referencing the uploaded file URL
        let skill = skills::ActiveModel {
            name: Set("WithFile".to_string()),
            icon_path: Set("/api/files/skills/test.png".to_string()),
            link: Set("".to_string()),
            active: Set(true),
            order: Set(0),
            ..Default::default()
        }
        .insert(&ctx.db)
        .await
        .unwrap();

        let res = request.delete(&format!("/api/skills/{}", skill.id)).await;
        assert_eq!(res.status_code(), 200);

        // file should be removed from filesystem
        assert!(!path.exists());
    })
    .await;
}

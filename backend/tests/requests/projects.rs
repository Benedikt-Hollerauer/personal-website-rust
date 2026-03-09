use backend::app::App;
use loco_rs::testing::prelude::*;
use loco_rs::app::AppContext;
use serial_test::serial;
use backend::models::_entities::projects;
use sea_orm::{ActiveModelTrait, EntityTrait};
use sea_orm::ActiveValue::Set;
use serde_json::json;

// Helper function to create a test project
async fn seed_project(
    ctx: &AppContext,
    title: &str,
    active: bool,
) -> projects::Model {
    projects::ActiveModel {
        title: Set(Some(title.to_string())),
        description: Set(Some("Test description".to_string())),
        link: Set(Some("https://example.com".to_string())),
        location: Set(Some("Test Location".to_string())),
        key_points: Set(Some(serde_json::json!({"point1": "value1"}))),
        start_date: Set(Some(chrono::NaiveDate::from_ymd_opt(2026, 3, 1).unwrap())),
        end_date: Set(Some(chrono::NaiveDate::from_ymd_opt(2026, 3, 31).unwrap())),
        active: Set(active),
        ..Default::default()
    }
    .insert(&ctx.db)
    .await
    .unwrap()
}

// Test: List projects when none exist
#[tokio::test]
#[serial]
async fn can_get_empty_projects_list() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/projects").await;
        assert_eq!(res.status_code(), 200, "GET /api/projects should return 200");
        
        let text = res.text();
        let json: serde_json::Value = serde_json::from_str(&text)
            .expect(&format!("Failed to parse JSON response: {}", text));
        assert!(json.is_array(), "Response should be an array. Got: {}", json);
        assert_eq!(json.as_array().unwrap().len(), 0, "Response should contain empty array");
    })
    .await;
}

// Test: List projects with multiple active projects
#[tokio::test]
#[serial]
async fn can_get_projects_list() {
    request::<App, _, _>(|request, ctx| async move {
        // Seed active projects
        let _ = seed_project(&ctx, "Active Project 1", true).await;
        let _ = seed_project(&ctx, "Active Project 2", true).await;
        
        let res = request.get("/api/projects").await;
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        let json: serde_json::Value = serde_json::from_str(&text)
            .expect(&format!("Failed to parse JSON: {}", text));
        assert!(json.is_array(), "Response should be an array");
        let arr = json.as_array().unwrap();
        assert!(arr.len() >= 2, "Should have at least 2 projects");
        
        let titles: Vec<&str> = arr.iter()
            .filter_map(|p| p.get("title").and_then(|t| t.as_str()))
            .collect();
        assert!(titles.contains(&"Active Project 1"));
        assert!(titles.contains(&"Active Project 2"));
    })
    .await;
}

// Test: List projects includes both active and inactive
#[tokio::test]
#[serial]
async fn can_get_projects_with_inactive() {
    request::<App, _, _>(|request, ctx| async move {
        let _ = seed_project(&ctx, "Active", true).await;
        let _ = seed_project(&ctx, "Inactive", false).await;
        
        let res = request.get("/api/projects").await;
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        let json: serde_json::Value = serde_json::from_str(&text)
            .expect(&format!("Failed to parse JSON: {}", text));
        assert!(json.is_array(), "Response should be an array");
        let arr = json.as_array().unwrap();
        assert!(arr.len() >= 2, "Should have at least 2 projects");
        
        let titles: Vec<&str> = arr.iter()
            .filter_map(|p| p.get("title").and_then(|t| t.as_str()))
            .collect();
        assert!(titles.contains(&"Active"));
        assert!(titles.contains(&"Inactive"));
    })
    .await;
}

// Test: Create a new project
#[tokio::test]
#[serial]
async fn can_create_project() {
    request::<App, _, _>(|request, ctx| async move {
        let payload = json!({
            "title": "New Test Project",
            "description": "A new project created via API",
            "link": "https://newproject.com",
            "location": "Remote",
            "start_date": "2026-03-01",
            "end_date": "2026-03-31"
        });

        let res = request.post("/api/projects").json(&payload).await;
        assert_eq!(
            res.status_code(),
            200,
            "POST /api/projects should return 200"
        );

        let text = res.text();
        let json: serde_json::Value = serde_json::from_str(&text)
            .expect(&format!("Failed to parse JSON: {}", text));
        
        assert_eq!(json.get("title").and_then(|t| t.as_str()), Some("New Test Project"));
        assert_eq!(json.get("description").and_then(|t| t.as_str()), Some("A new project created via API"));
        assert_eq!(json.get("active").and_then(|t| t.as_bool()), Some(true), "New project should be active by default");

        // Verify it was saved in the database
        let projects_in_db = projects::Entity::find()
            .all(&ctx.db)
            .await
            .unwrap();
        assert!(
            projects_in_db.iter().any(|p| p.title == Some("New Test Project".to_string())),
            "Project should be saved in DB"
        );
    })
    .await;
}

// Test: Create project with key points
#[tokio::test]
#[serial]
async fn can_create_project_with_key_points() {
    request::<App, _, _>(|request, _ctx| async move {
        let payload = json!({
            "title": "Project with Points",
            "description": "Has key points",
            "key_points": {
                "point_1": "First key point",
                "point_2": "Second key point"
            }
        });

        let res = request.post("/api/projects").json(&payload).await;
        assert_eq!(res.status_code(), 200);

        let text = res.text();
        let json: serde_json::Value = serde_json::from_str(&text)
            .expect(&format!("Failed to parse JSON: {}", text));
        
        assert_eq!(json.get("title").and_then(|t| t.as_str()), Some("Project with Points"));
        
        // Check key_points is present
        let key_points = json.get("key_points").expect("key_points should exist");
        assert_eq!(key_points.get("point_1").and_then(|v| v.as_str()), Some("First key point"));
        assert_eq!(key_points.get("point_2").and_then(|v| v.as_str()), Some("Second key point"));
    })
    .await;
}

// Test: Get a single project by ID
#[tokio::test]
#[serial]
async fn can_get_single_project() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "Single Project", true).await;
        
        let res = request
            .get(&format!("/api/projects/{}", project.id))
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("Single Project"));
        assert!(text.contains(&project.id.to_string()));
    })
    .await;
}

// Test: Get non-existent project returns 404
#[tokio::test]
#[serial]
async fn get_nonexistent_project_returns_404() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/projects/99999").await;
        assert_eq!(res.status_code(), 404, "Should return 404 for non-existent project");
    })
    .await;
}

// Test: Update project title
#[tokio::test]
#[serial]
async fn can_update_project_title() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "Original Title", true).await;
        
        let payload = json!({
            "title": "Updated Title"
        });

        let res = request
            .patch(&format!("/api/projects/{}", project.id))
            .json(&payload)
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("Updated Title"));
        assert!(!text.contains("Original Title"));
    })
    .await;
}

// Test: Update project active status
#[tokio::test]
#[serial]
async fn can_toggle_project_active_status() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "Toggleable", true).await;
        
        // Deactivate the project
        let payload = json!({
            "active": false
        });

        let res = request
            .patch(&format!("/api/projects/{}", project.id))
            .json(&payload)
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("\"active\":false"), "Project should be deactivated");
        
        // Reactivate
        let payload = json!({
            "active": true
        });

        let res = request
            .patch(&format!("/api/projects/{}", project.id))
            .json(&payload)
            .await;
        
        let text = res.text();
        assert!(text.contains("\"active\":true"), "Project should be reactivated");
    })
    .await;
}

// Test: Update multiple fields at once
#[tokio::test]
#[serial]
async fn can_update_multiple_fields() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "Original", true).await;
        
        let payload = json!({
            "title": "Updated Project",
            "description": "Updated description",
            "location": "San Francisco",
            "active": false
        });

        let res = request
            .patch(&format!("/api/projects/{}", project.id))
            .json(&payload)
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("Updated Project"));
        assert!(text.contains("Updated description"));
        assert!(text.contains("San Francisco"));
        assert!(text.contains("\"active\":false"));
    })
    .await;
}

// Test: Delete a project
#[tokio::test]
#[serial]
async fn can_delete_project() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "To Delete", true).await;
        let project_id = project.id;
        
        // Delete the project
        let res = request
            .delete(&format!("/api/projects/{}", project_id))
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("\"success\":true"));
        
        // Verify it's deleted from DB
        let found = projects::Entity::find_by_id(project_id)
            .one(&ctx.db)
            .await
            .unwrap();
        
        assert!(found.is_none(), "Project should be deleted from database");
    })
    .await;
}

// Test: Delete non-existent project returns 404
#[tokio::test]
#[serial]
async fn delete_nonexistent_project_returns_404() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.delete("/api/projects/99999").await;
        assert_eq!(res.status_code(), 404);
    })
    .await;
}

// Test: Update with dates
#[tokio::test]
#[serial]
async fn can_update_project_dates() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "Date Project", true).await;
        
        let payload = json!({
            "start_date": "2025-01-01",
            "end_date": "2025-12-31"
        });

        let res = request
            .patch(&format!("/api/projects/{}", project.id))
            .json(&payload)
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("2025-01-01"));
        assert!(text.contains("2025-12-31"));
    })
    .await;
}

// Test: Partial update doesn't overwrite other fields
#[tokio::test]
#[serial]
async fn partial_update_preserves_other_fields() {
    request::<App, _, _>(|request, ctx| async move {
        let project = seed_project(&ctx, "Original Title", true).await;
        
        // Update only title
        let payload = json!({
            "title": "New Title"
        });

        let res = request
            .patch(&format!("/api/projects/{}", project.id))
            .json(&payload)
            .await;
        
        assert_eq!(res.status_code(), 200);
        
        let text = res.text();
        assert!(text.contains("New Title"));
        // Other fields should be preserved
        assert!(text.contains("Test description"));
        assert!(text.contains("https://example.com"));
    })
    .await;
}
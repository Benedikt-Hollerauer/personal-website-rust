use backend::app::App;
use loco_rs::testing::prelude::*;
use serial_test::serial;
use backend::models::_entities::projects;
use sea_orm::ActiveModelTrait;
use sea_orm::ActiveValue::Set;

#[tokio::test]
#[serial]
async fn can_get_projects() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/projects/").await;
        assert_eq!(res.status_code(), 200);

        // you can assert content like this:
        // assert_eq!(res.text(), "content");
    })
    .await;
}

#[tokio::test]
#[serial]
async fn can_get_no_projects_list() {
    request::<App, _, _>(|request, _ctx| async move {
        // 1. Don't SEED DB with any projects
        // 2. EXECUTE: Call your existing controller
        let res = request.get("/api/projects").await;

        //println!("{:#?}", res.text());

        // 3. ASSERT: Check if it returns 200 and the data
        assert_eq!(res.status_code(), 200);
    }).await;
}

#[tokio::test]
#[serial]
async fn can_get_projects_list() {
    request::<App, _, _>(|request, ctx| async move {
        // 1. SEED: Put a fake project in the DB
        let _ = projects::ActiveModel {
            created_at: Default::default(),
            updated_at: Default::default(),
            id: Default::default(),
            title: Set(Some("My Portfolio".to_string())),
            description: Set(Some("Built with Rust".to_string())),
            link: Default::default(),
            location: Default::default(),
            key_points: Default::default(),
            start_date: Default::default(),
            end_date: Default::default(),
        }
            .insert(&ctx.db)
            .await
            .unwrap();

        // 2. EXECUTE: Call your existing controller
        let res = request.get("/api/projects").await;

        //println!("{:#?}", res.text());

        // 3. ASSERT: Check if it returns 200 and the data
        assert_eq!(res.status_code(), 200);
        assert!(res.text().contains("My Portfolio"));
    }).await;
}
use backend::app::App;
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn admin_user_can_register_and_login() {
    request::<App, _, _>(|request, ctx| async move {
        // Step 1: Register the admin user
        let register_payload = serde_json::json!({
            "name": "Admin",
            "email": "test@test.com",
            "password": "Jannik123!"  
        });
        
        let register_response = request
            .post("/api/auth/register")
            .json(&register_payload)
            .await;
        
        eprintln!("Register status: {}", register_response.status_code());
        assert_eq!(register_response.status_code(), 200, "Registration should succeed");
        
        // Step 2: Get verification token and verify the user
        let user = backend::models::users::Model::find_by_email(&ctx.db, "test@test.com")
            .await
            .expect("User should be found after registration");
        
        let verification_token = user
            .email_verification_token
            .expect("Verification token should exist");
        
        // Verify user email using the token from URL
        let verify_response = request
            .get(&format!("/api/auth/verify/{}", verification_token))
            .await;
        
        eprintln!("Verify status: {}", verify_response.status_code());
        assert_eq!(verify_response.status_code(), 200, "Verification should succeed");
        
        // Step 3: Login with the verified credentials
        let login_payload = serde_json::json!({
            "email": "test@test.com",
            "password": "Jannik123!"
        });
        
        let login_response = request
            .post("/api/auth/login")
            .json(&login_payload)
            .await;
        
        eprintln!("Login status: {}", login_response.status_code());
        eprintln!("Login body: {}", login_response.text());
        
        assert_eq!(login_response.status_code(), 200, "Login should succeed");
        let json: serde_json::Value = serde_json::from_str(&login_response.text())
            .expect("Response should be valid JSON");
        assert!(json.get("token").is_some(), "Should return a token");
    })
    .await;
}

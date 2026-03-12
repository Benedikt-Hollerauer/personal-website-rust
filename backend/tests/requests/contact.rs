use backend::app::App;
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_send_contact_message() {
    request::<App, _, _>(|request, _ctx| async move {
        let params = serde_json::json!({
            "name": "John Doe",
            "email": "john.doe@example.com",
            "message": "Hello, this is a test message.",
            "captchaToken": "test-captcha-token"
        });

        let res = request.post("/api/contact/").json(&params).await;
        assert_eq!(res.status_code(), 200);
    })
    .await;
}


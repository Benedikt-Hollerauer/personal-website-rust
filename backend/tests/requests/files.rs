use backend::app::App;
use loco_rs::testing::prelude::*;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn upload_and_serve_and_delete_file() {
    request::<App, _, _>(|request, _ctx| async move {
        // prepare a simple multipart body with a small text file
        let boundary = "boundary123";
        let mut body = Vec::new();
        body.extend(format!("--{}\r\n", boundary).as_bytes());
        body.extend(b"Content-Disposition: form-data; name=\"file\"; filename=\"hello.txt\"\r\n");
        body.extend(b"Content-Type: text/plain\r\n\r\n");
        body.extend(b"hello world");
        body.extend(format!("\r\n--{}--\r\n", boundary).as_bytes());

        let res = request
            .post("/api/upload?category=skills")
            .header(
                "content-type",
                format!("multipart/form-data; boundary={}", boundary),
            )
            .body(body)
            .await;
        assert_eq!(res.status_code(), 200);
        let json: serde_json::Value = serde_json::from_str(&res.text()).unwrap();
        let url = json
            .get("url")
            .and_then(|v| v.as_str())
            .expect("missing url");

        // uploaded url should point under /api/files/skills/
        assert!(url.starts_with("/api/files/skills/"));
        let filename = url.split('/').last().unwrap();

        // GET the file
        let get_res = request.get(url).await;
        assert_eq!(get_res.status_code(), 200);
        assert_eq!(get_res.text(), "hello world");
        assert_eq!(get_res.header("content-type").unwrap(), "text/plain");

        // delete
        let del_res = request.delete(&format!("/api/files/skills/{}", filename)).await;
        assert_eq!(del_res.status_code(), 200);
        let del_json: serde_json::Value = serde_json::from_str(&del_res.text()).unwrap();
        assert_eq!(del_json.get("success").and_then(|v| v.as_bool()), Some(true));

        // subsequent GET should return 404
        let get_res2 = request.get(&format!("/api/files/skills/{filename}")).await;
        assert_eq!(get_res2.status_code(), 404);
    })
    .await;
}

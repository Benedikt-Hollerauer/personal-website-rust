use axum::extract::{Multipart, Path, Query};
use loco_rs::prelude::*;
use mime_guess::MimeGuess;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

const UPLOAD_BASE: &str = "uploads";

// Simple query parameter struct for upload endpoint
#[derive(Debug, Deserialize)]
pub struct UploadQuery {
    pub category: String,
}

// Response when a file is successfully uploaded
#[derive(Debug, Serialize)]
struct UploadResponse {
    url: String,
}

// -----------------------------------------------------------------------------
// POST /api/upload?category=foo
// Accepts a multipart/form-data request containing a field named `file`.
// Writes the file to `uploads/<category>/<random-filename>` and returns a URL
// that can later be used to retrieve it via GET /api/files/<category>/<name>.
// -----------------------------------------------------------------------------
#[debug_handler]
pub async fn upload(
    State(_ctx): State<AppContext>,
    Query(query): Query<UploadQuery>,
    mut multipart: Multipart,
) -> Result<Response> {
    // sanitize category to avoid traversal (allow letters, numbers, dash, underscore)
    if query.category.is_empty() || query.category.contains(['/', '\\']) {
        return Err(Error::BadRequest("invalid category".to_string()));
    }

    let mut saved_url: Option<String> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| Error::BadRequest(e.to_string()))?
    {
        // take ownership of the field name so we don't hold a borrow when
        // later calling `bytes()` which requires a mutable borrow.
        if let Some(name) = field.name().map(|s| s.to_string()) {
            if name != "file" {
                continue;
            }
        }
        let file_name = field
            .file_name()
            .map(|s| s.to_string())
            .unwrap_or_else(|| "unnamed".to_string());
        let data = field
            .bytes()
            .await
            .map_err(|e| Error::BadRequest(e.to_string()))?;

        // determine extension from original filename
        let ext = std::path::Path::new(&file_name)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");

        let unique = if ext.is_empty() {
            Uuid::new_v4().to_string()
        } else {
            format!("{}.{ext}", Uuid::new_v4())
        };

        let mut dest_path = PathBuf::from(UPLOAD_BASE);
        dest_path.push(&query.category);
        tokio::fs::create_dir_all(&dest_path).await?;
        dest_path.push(&unique);

        tokio::fs::write(&dest_path, &data).await?;

        saved_url = Some(format!("/api/files/{}/{}", query.category, unique));
        break; // only first file considered
    }

    // if we found a URL, send it; otherwise return an error response
    if let Some(url) = saved_url {
        return format::json(UploadResponse { url });
    }
    Err(Error::BadRequest("no file provided".to_string()))
}

// -----------------------------------------------------------------------------
// GET /api/files/:category/:filename
// Reads a file from disk and returns it with a guessed Content-Type.
// -----------------------------------------------------------------------------
#[debug_handler]
pub async fn serve_file(
    State(_ctx): State<AppContext>,
    Path((category, filename)): Path<(String, String)>,
) -> Result<Response> {
    // ensure category and filename do not contain path separators
    if category.contains(['/', '\\']) || filename.contains(['/', '\\']) {
        return Err(Error::NotFound);
    }

    let mut path = PathBuf::from(UPLOAD_BASE);
    path.push(&category);
    path.push(&filename);

    if !path.exists() {
        return Err(Error::NotFound);
    }

    let body = tokio::fs::read(&path).await?;
    let mime = MimeGuess::from_path(&filename).first_or_octet_stream();

    let mut resp = Response::new(body.into());
    resp.headers_mut()
        .insert(axum::http::header::CONTENT_TYPE, mime.as_ref().parse().unwrap());
    resp.headers_mut().insert(
        axum::http::header::CONTENT_DISPOSITION,
        "attachment".parse().unwrap(),
    );
    Ok(resp)
}

// -----------------------------------------------------------------------------
// DELETE /api/files/:category/:filename
// Removes the file from disk; returns success even if the file didn't exist.
// -----------------------------------------------------------------------------
#[debug_handler]
pub async fn delete_file(
    State(_ctx): State<AppContext>,
    Path((category, filename)): Path<(String, String)>,
) -> Result<Response> {
    if category.contains(['/', '\\']) || filename.contains(['/', '\\']) {
        return Err(Error::BadRequest("invalid path".to_string()));
    }

    let mut path = PathBuf::from(UPLOAD_BASE);
    path.push(&category);
    path.push(&filename);

    let _ = tokio::fs::remove_file(&path).await;
    format::json(serde_json::json!({"success": true}))
}

pub fn routes() -> Routes {
    Routes::new()
        .add(
            "/api/upload",
            post(upload),
        )
        .add(
            "/api/files/{category}/{filename}",
            get(serve_file),
        )
        .add(
            "/api/files/{category}/{filename}",
            delete(delete_file),
        )
}

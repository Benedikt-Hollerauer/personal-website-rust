use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        create_table(m, "projects",
            &[
            
            ("id", ColType::PkAuto),
            
            ("title", ColType::StringNull),
            ("description", ColType::TextNull),
            ("link", ColType::StringNull),
            ("location", ColType::StringNull),
            ("key_points", ColType::JsonNull),
            ("start_date", ColType::DateNull),
            ("end_date", ColType::DateNull),
            ],
            &[
            ]
        ).await
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        drop_table(m, "projects").await
    }
}

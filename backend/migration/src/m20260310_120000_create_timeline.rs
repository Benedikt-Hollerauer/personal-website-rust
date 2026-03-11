use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_table(manager, "timelines",
            &[
            ("id", ColType::PkAuto),
            ("title", ColType::String),
            ("description", ColType::Text),
            ("start_date", ColType::Date),
            ("end_date", ColType::DateNull),
            ("order", ColType::Integer),
            ],
            &[]
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_table(manager, "timelines").await
    }
}

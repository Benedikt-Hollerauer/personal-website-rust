use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_table(manager, "resources",
            &[
            ("id", ColType::PkAuto),
            ("title", ColType::String),
            ("description", ColType::Text),
            ("resource_url", ColType::String),
            ("active", ColType::Boolean),
            ("order", ColType::Integer),
            ],
            &[]
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_table(manager, "resources").await
    }
}

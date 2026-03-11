use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_table(manager, "skills",
            &[
            ("id", ColType::PkAuto),
            ("name", ColType::String),
            ("icon_path", ColType::String),
            ("link", ColType::String),
            ("active", ColType::Boolean),
            ("order", ColType::Integer),
            ],
            &[]
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_table(manager, "skills").await
    }
}

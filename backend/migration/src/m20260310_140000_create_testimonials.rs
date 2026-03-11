use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_table(manager, "testimonials",
            &[
            ("id", ColType::PkAuto),
            ("name", ColType::String),
            ("role", ColType::String),
            ("content", ColType::Text),
            ("active", ColType::Boolean),
            ("order", ColType::Integer),
            ],
            &[]
        ).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_table(manager, "testimonials").await
    }
}

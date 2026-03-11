use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Testimonials::Table)
                .add_column(ColumnDef::new(Testimonials::Link).string().null())
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Testimonials::Table)
                .drop_column(Testimonials::Link)
                .to_owned(),
        )
        .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Testimonials {
    Table,
    Link,
}

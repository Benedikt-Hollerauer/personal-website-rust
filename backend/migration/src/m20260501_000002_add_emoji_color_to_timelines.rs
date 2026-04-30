use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Timelines::Table)
                .add_column(ColumnDef::new(Timelines::Emoji).string().null())
                .add_column(ColumnDef::new(Timelines::AccentColor).string().null())
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Timelines::Table)
                .drop_column(Timelines::Emoji)
                .drop_column(Timelines::AccentColor)
                .to_owned(),
        )
        .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Timelines {
    Table,
    Emoji,
    AccentColor,
}

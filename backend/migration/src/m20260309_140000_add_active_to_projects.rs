use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Projects::Table)
                .add_column(ColumnDef::new(Projects::Active).boolean().default(true))
                .to_owned(),
        )
        .await?;
        Ok(())
    }

    async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
        m.alter_table(
            Table::alter()
                .table(Projects::Table)
                .drop_column(Projects::Active)
                .to_owned(),
        )
        .await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
pub enum Projects {
    Table,
    Active,
}

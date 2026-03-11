#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20260306_112925_projects;
mod m20260309_140000_add_active_to_projects;
mod m20260310_100000_create_about_texts;
mod m20260310_110000_create_skills;
mod m20260310_120000_create_timeline;
mod m20260310_130000_create_resources;
mod m20260310_140000_create_testimonials;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_users::Migration),
            Box::new(m20260306_112925_projects::Migration),
            Box::new(m20260309_140000_add_active_to_projects::Migration),
            Box::new(m20260310_100000_create_about_texts::Migration),
            Box::new(m20260310_110000_create_skills::Migration),
            Box::new(m20260310_120000_create_timeline::Migration),
            Box::new(m20260310_130000_create_resources::Migration),
            Box::new(m20260310_140000_create_testimonials::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}
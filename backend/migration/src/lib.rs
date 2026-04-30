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
mod m20260311_120000_add_link_to_testimonials;
mod m20260501_000001_add_original_filename_to_resources;
mod m20260501_000002_add_emoji_color_to_timelines;
mod m20260501_000003_add_order_to_projects;
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
            Box::new(m20260311_120000_add_link_to_testimonials::Migration),
            Box::new(m20260501_000001_add_original_filename_to_resources::Migration),
            Box::new(m20260501_000002_add_emoji_color_to_timelines::Migration),
            Box::new(m20260501_000003_add_order_to_projects::Migration),
            // inject-above (do not remove this comment)
        ]
    }
}
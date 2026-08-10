mod filesystem;
mod project_manager;
mod project_model;
mod uuid_gen;

pub use filesystem::projects_root;
pub use project_manager::ProjectManager;
pub use project_model::{ProjectManifest, ProjectSummary, DEFAULT_CATEGORIES};

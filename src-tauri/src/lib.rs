mod commands;
mod core;

use commands::project_commands::{create_project, delete_project, list_projects, open_project};
use commands::settings_commands::{load_settings, save_settings};
use commands::texture_commands::{
    create_texture, delete_texture, export_texture, file_size_bytes, import_texture, list_textures,
    load_texture_layers, resize_texture, save_texture_layers, save_texture_layers_as,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      list_projects,
      create_project,
      delete_project,
      open_project,
      list_textures,
      create_texture,
      delete_texture,
      import_texture,
      export_texture,
      file_size_bytes,
      load_texture_layers,
      resize_texture,
      save_texture_layers,
      save_texture_layers_as,
      load_settings,
      save_settings,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

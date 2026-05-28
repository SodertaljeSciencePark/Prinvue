#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Printer {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub name: String,
    pub ip: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access_code: Option<String>,
    pub model_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub serial: Option<String>,
    #[serde(default)]
    pub has_camera: bool,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PrinterStats {
    pub current_status: Option<String>,
    pub progress_percent: Option<f32>,
    pub nozzle_temp: Option<f32>,
    pub bed_temp: Option<f32>,
}

fn trim_url(url: &str) -> String {
    url.trim_end_matches('/').to_string()
}

#[tauri::command]
async fn fetch_printers(server_url: String) -> Result<Vec<Printer>, String> {
    let endpoint = format!("{}/api/v1/printers", trim_url(&server_url));
    reqwest::get(&endpoint)
        .await
        .map_err(|e| e.to_string())?
        .json::<Vec<Printer>>()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_printer(server_url: String, printer: Printer) -> Result<(), String> {
    let endpoint = format!("{}/api/v1/printers", trim_url(&server_url));
    Client::new()
        .post(&endpoint)
        .json(&printer)
        .send()
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_printer(server_url: String, printer: Printer) -> Result<(), String> {
    let id = printer.id.clone().ok_or("Printer has no ID")?;
    let endpoint = format!("{}/api/v1/printers/{}", trim_url(&server_url), id);
    Client::new()
        .put(&endpoint)
        .json(&printer)
        .send()
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_printer(server_url: String, printer_id: String) -> Result<(), String> {
    let endpoint = format!("{}/api/v1/printers/{}", trim_url(&server_url), printer_id);
    Client::new()
        .delete(&endpoint)
        .send()
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_printer_stats(server_url: String, id: String) -> Result<PrinterStats, String> {
    let endpoint = format!("{}/api/v1/printers/{}/stats", trim_url(&server_url), id);
    reqwest::get(&endpoint)
        .await
        .map_err(|e| e.to_string())?
        .json::<PrinterStats>()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn export_printers(server_url: String) -> Result<String, String> {
    let endpoint = format!("{}/api/v1/printers/export/json", trim_url(&server_url));
    let res = reqwest::get(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Server returned {}", res.status()));
    }

    res.text().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn import_printers(server_url: String, json_content: String) -> Result<String, String> {
    let endpoint = format!("{}/api/v1/printers/import/json", trim_url(&server_url));

    let part = reqwest::multipart::Part::text(json_content)
        .file_name("import.json")
        .mime_str("application/json")
        .map_err(|e| e.to_string())?;

    let form = reqwest::multipart::Form::new().part("file", part);

    let res = Client::new()
        .post(&endpoint)
        .multipart(form)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    if status.is_success() {
        Ok(body)
    } else {
        Err(body)
    }
}

#[tauri::command]
async fn fetch_printer_logs(server_url: String, printer_id: String) -> Result<String, String> {
    let endpoint = format!("{}/api/v1/logs/{}", trim_url(&server_url), printer_id);
    let res = reqwest::get(&endpoint)
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Server returned {}", res.status()));
    }

    res.text().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_printer_logs(server_url: String, printer_id: String) -> Result<(), String> {
    let endpoint = format!("{}/api/v1/logs/{}", trim_url(&server_url), printer_id);
    Client::new()
        .delete(&endpoint)
        .send()
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_all_logs(server_url: String) -> Result<(), String> {
    let endpoint = format!("{}/api/v1/logs/all", trim_url(&server_url));
    Client::new()
        .delete(&endpoint)
        .send()
        .await
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn restart_docker_services(server_url: String) -> Result<String, String> {
    let endpoint = format!("{}/api/v1/system/restart", trim_url(&server_url));
    Client::new()
        .post(&endpoint)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok("Services restart sequence initiated".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fetch_printers,
            add_printer,
            update_printer,
            delete_printer,
            get_printer_stats,
            export_printers,
            import_printers,
            fetch_printer_logs,
            clear_printer_logs,
            clear_all_logs,
            restart_docker_services,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

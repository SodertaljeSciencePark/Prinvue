# Prinvue User Manual

This manual provides a detailed walkthrough of every feature, button, and configuration option in the Prinvue application.

## 1. Sidebar Navigation

The sidebar is your primary tool for navigating the application and managing your printer fleet.

- **PRINVUE / P Logo**: Click to return to the Fleet Overview.
- **Collapse/Expand Arrow (top)**: Toggles the sidebar between full-width (with labels) and icon-only mode to save screen space.
- **Overview Grid Icon**: Returns you to the "Fleet Overview" where all your printers are displayed as cards.
- **Printer List**: Every printer you add will appear here. Click a printer to open its individual **Dashboard**.
- **+ Add Printer**: Opens a modal to register a new 3D printer.
- **Settings Gear Icon (bottom)**: Opens the global application settings.
- **Documentation Icon (bottom)**: Opens this documentation viewer.

## 2. Fleet Overview

The Fleet Overview is your command center for multiple printers.

- **Import Button**: Allows you to restore printer configurations from a JSON file.
- **Export Button**: Downloads all current printer configurations to a JSON file for backup.
- **Fullscreen Icon**: Toggles the application to full-screen mode for dedicated monitoring.
- **Printer Cards**: 
    - **Header**: Shows the name, model, and current status (e.g., IDLE, PRINTING, OFFLINE).
    - **Camera View**: Shows a live snapshot if a camera is configured.
    - **Telemetry**: Displays live Nozzle/Bed temperatures and progress.
    - **Sparklines**: Small charts showing temperature trends for the last 30 minutes.
    - **Progress Bar**: A visual indicator at the bottom of the card showing job completion.

## 3. Printer Dashboard

Clicking a printer card opens its dedicated monitoring dashboard.

### Header Controls
- **Edit Setup**: Opens a modal to change the printer's name, IP, or access codes.
- **Remove**: Deletes the printer from your fleet (requires confirmation).
- **Status Badge**: Shows the real-time status reported by the printer.

### Main View
- **Live Broadcast Feed**: A real-time video stream from your printer. 
    - *Note: If the feed fails, click the placeholder to retry the connection.*
- **Job Completion Progress**: Large visual gauge of the current print job.
- **Active Nozzle / Heated Bed**: Real-time temperature readouts.
- **Historical Analytics (Timeline)**: A detailed interactive chart showing temperature history.

### System Telemetry Logs (Bottom)
This section shows the data recorded by the backend.
- **Refresh Logs**: Manually pull the latest events from the database.
- **Clear Logs**: Deletes all recorded telemetry logs for *only this printer*.

## 4. Settings & Danger Zone

The Settings tab controls how the application interacts with your server.

- **Server URL**: The address of your backend server (usually `http://127.0.0.1:8080` if running locally).
- **Application Theme**: Choose from several themes like Dark, Light, Ocean, or Catppuccin.
- **Save Settings**: Applies and persists your changes.

### Danger Zone
- **Clear All Database Logs**: A global cleanup button that wipes all telemetry history for all printers. Useful for saving disk space.
- **Restart Docker Services**: Communicates with the host system to run `docker compose restart`. This is useful if the backend becomes unresponsive or if you've made configuration changes.

## 5. Adding & Editing Printers

When adding or editing a printer, you must provide:
- **Model**: Select between Bambu Lab X-Series, P-Series, or Prusa.
- **Name**: A nickname for your printer.
- **IP Address**: The local network address of the printer.
- **Serial Number (Bambu)**: Required for MQTT telemetry connection.
- **Access Code (Bambu/Prusa)**: The password or LAN code found on your printer's screen.
- **Has Camera**: Toggles whether the dashboard should attempt to start a video stream.

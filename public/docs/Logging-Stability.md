# Logging & Stability System

Prinvue is designed to be a "set-and-forget" monitoring solution. To achieve this, the logging system handles data collection and maintenance automatically.

## 1. How Logs Work

The system uses a background service in the Java backend (`LogRecorderService`) that performs the following tasks:

### Telemetry Snapshots
Every **30 seconds**, the system polls every "Online" printer and records a `TELEMETRY_SNAPSHOT`. This snapshot includes:
- **Current Status**: (e.g., "Printing", "Idle")
- **Progress**: (0-100%)
- **Nozzle Temperature**
- **Bed Temperature**
- **Timestamp**

These logs are stored in a PostgreSQL database and are used to populate the history charts and the log tables in the frontend.

### Automatic Pruning (Storage Protection)
To ensure the system can run for months without filling up your disk, a scheduled task runs **every hour** to prune old data.
- **Retention Period**: 7 Days.
- Any log entry older than 7 days is automatically deleted from the database.
- This keeps the database size predictable and the application fast.

## 2. Stability Features

### MQTT Auto-Reconnection
For Bambu Lab printers, the MQTT connection (used for live stats) is configured with an **Automatic Reconnect** policy. If the printer goes offline or the network drops, the system will attempt to reconnect every few seconds, increasing the interval up to 1 minute, until the connection is restored.

### Staleness Detection (The "Anti-Freeze" Fix)
If a printer stops sending data but the connection isn't explicitly closed, the system might "freeze" on old values. Prinvue prevents this by tracking the `lastUpdated` timestamp.
- If no data is received for **20 seconds**, the printer is automatically marked as `OFFLINE (STALE)`.
- This ensures that you always see an accurate representation of the printer's state.

### Resource Cleanup
Camera streams (RTSP/P-Series) are highly resource-intensive. The system includes explicit cleanup logic:
- When you close a dashboard, the backend immediately stops the FFmpeg grabber and releases the associated memory.
- The system detects if the frontend "hangs" or disconnects and terminates the stream automatically to prevent RAM leaks.

### Docker Resource Limits
The `compose.yml` file is configured with hard memory limits:
- **Backend App**: Limited to 1024MB RAM.
- **Database**: Limited to 512MB RAM.
This prevents the application from consuming all system resources even in the event of an unexpected bug.

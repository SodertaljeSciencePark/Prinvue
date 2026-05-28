# Troubleshooting & Support

If you encounter issues while using Prinvue, follow these steps to diagnose and resolve them.

## Common Issues

### 1. Printer Status is "OFFLINE"
- **Network**: Ensure the printer and the Prinvue server are on the same local network.
- **IP Address**: Check if the printer's IP has changed (many routers assign new IPs periodically).
- **Access Code**: For Bambu Lab printers, the Access Code can change if network settings are reset on the printer.
- **LAN Only Mode**: For X1-Series, ensure "LAN Only Mode" is enabled in the printer's settings.

### 2. Camera Feed is Black or Loading
- **Bandwidth**: Camera streams require significant bandwidth. If you are using Bambu Studio or another app simultaneously, the printer might refuse a second stream.
- **Credentials**: Double-check the Access Code. The camera uses the same credentials as the telemetry.
- **Retry**: Click on the camera feed area to attempt a manual reconnection.

### 3. Application is Slow
- **Log Bloat**: If the app feels sluggish, go to **Settings** and click **Clear All Database Logs**. While there is auto-pruning, a fresh start can sometimes help.
- **Restart Services**: Use the **Restart Docker Services** button in Settings to refresh the backend memory and connections.

### 4. "Permission Denied" when restarting services
- **SELinux**: If you are running on a Linux distribution with SELinux (like Fedora, RHEL, or CentOS), the system might block the container from accessing the Docker socket.
- **Solution**: Open `compose.yml` in the `printerkurwa/` folder and add `:Z` to the end of the docker socket volume mount:
  ```yaml
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:Z
  ```
  After saving, recreate the container to apply the changes.

If you find a persistent bug that isn't covered here, please report it via the project repository on github or mail. 
[Desktop app Github](https://github.com/SodertaljeSciencePark/Prinvue).
[Server app Github](https://github.com/SodertaljeSciencePark/printerkurwa).
victor.hernandez@bytebase.se
 Include as much detail as possible, such as:
- Printer model.
- What you were doing when the error occurred.
- Any error messages visible in the UI or backend logs.

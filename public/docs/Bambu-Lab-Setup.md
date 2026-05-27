# Bambu Lab Connection Guide

Prinvue supports **Bambu Lab X-Series** (X1, X1C) and **P-Series** (P1P, P1S) printers. We use a combination of MQTT for telemetry and RTSP/Custom protocols for the live camera feed.

## Prerequisites

### 1. Enable LAN Only Mode (X-Series Only)
To allow Prinvue to talk to your X-Series printer directly:
- On the printer screen, go to **Settings > LAN Only Mode**.
- Toggle it **ON**.
- Note the **Access Code** displayed on this screen.

### 2. Get your Serial Number
- Go to **Settings > Device** (or "General").
- Find the **Serial Number** (a long alphanumeric string starting with 01P... or 01S...).

## Adding the Printer to Prinvue

1.  Click **Add Printer** in the sidebar.
2.  Select the correct **Model** (X-Series or P-Series).
3.  **Name**: Give it a descriptive name.
4.  **IP Address**: Found under **Settings > WLAN** on your printer.
5.  **Serial Number**: Enter the serial you found earlier.
6.  **Access Code**:
    - **X-Series**: Found in the LAN Only Mode settings.
    - **P-Series**: Found under **Settings > WLAN**.
7.  **Has Camera**: Ensure this is checked if your printer has a functional camera.

## How it Connects

- **Telemetry (Stats)**: Prinvue connects to the printer's internal MQTT broker on port `8883` using the username `bblp` and your Access Code as the password.
- **Camera (X-Series)**: Uses an encrypted RTSP stream on port `322`.
- **Camera (P-Series)**: Uses a proprietary frame-by-stream protocol on port `6000`.

*Note: Prinvue handles all the complex handshaking and certificates automatically.*

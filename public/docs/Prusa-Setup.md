# Prusa Connection Guide

Prinvue connects to Prusa printers using **PrusaLink**, which is a high-level API available on most modern Prusa machines.

## Compatible Models
- **MK4 / MK3.5 / MK3.9**
- **XL**
- **MINI / MINI+** (with latest firmware)
- **SL1 / SL1S Speed**

## Connection Requirements

### 1. Enable PrusaLink
Ensure PrusaLink is enabled in your printer's settings:
- On the printer, go to **Settings > Network > PrusaLink**.
- Ensure it is set to **Enabled**.

### 2. Gather Credentials
You will need three pieces of information:
- **IP Address**: Found under **Settings > Network**.
- **Username**: This is almost always `maker`.
- **Password**: Found in the **PrusaLink** settings menu on the printer.

## Adding the Printer to Prinvue

1.  Click **Add Printer** in the sidebar.
2.  Select **Prusa (Link)** as the model.
3.  **Name**: Your preferred nickname.
4.  **IP Address**: The address from your printer's network menu.
5.  **Username**: Enter `maker`.
6.  **Password**: Enter the PrusaLink password.
7.  **Has Camera**: Note that standard PrusaLink does not support video streaming in Prinvue at this time.

## How it Connects

Prinvue uses a background poller that makes a REST API request to your printer every 10 seconds.
- If the printer is busy or the network is slow, the poller will automatically "back off" and try less frequently to avoid overloading the printer's CPU.
- If the printer becomes unreachable, it will be marked as **OFFLINE** in the dashboard.
me
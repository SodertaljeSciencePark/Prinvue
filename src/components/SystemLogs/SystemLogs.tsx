import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Printer, PrinterLog } from '../../Types';
import './SystemLogs.css';

interface Props {
  printer: Printer;
  embedded?: boolean;
}

export default function SystemLogs({ printer, embedded = false }: Props) {
  const [logs, setLogs] = useState<PrinterLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const getServerUrl = () => {
    let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url;
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const raw: string = await invoke('fetch_printer_logs', {
        serverUrl: getServerUrl(),
        printerId: printer.id,
      });
      setLogs(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs for this printer?')) return;
    setIsClearing(true);
    try {
      await invoke('clear_printer_logs', {
        serverUrl: getServerUrl(),
        printerId: printer.id,
      });
      setLogs([]);
    } catch (e) {
      alert('Failed to clear logs');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [printer]);

  return (
    <div className={`logs-container${embedded ? ' logs-embedded' : ''}`}>
      {!embedded && (
        <header className="logs-header">
          <h2>System Logs: {printer.name}</h2>
        </header>
      )}
      <div className="logs-top-bar">
        <button className="btn-refresh" onClick={fetchLogs} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
        <button className="btn-clear" onClick={clearLogs} disabled={isClearing || logs.length === 0}>
          {isClearing ? 'Clearing...' : 'Clear Logs'}
        </button>
      </div>

      <div className="logs-table-box">
        <div className="table-wrapper">
          {isLoading && logs.length === 0 ? (
            <div className="loading-shimmer">Loading logs...</div>
          ) : logs.length > 0 ? (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Message</th>
                  <th>NZL/BED</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="timestamp">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className={`event-type ${log.eventType.toLowerCase()}`}>{log.eventType}</td>
                    <td className="message">{log.message}</td>
                    <td className="temps">{log.nozzleTemp}° / {log.bedTemp}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No recorded logs for this printer.</div>
          )}
        </div>
      </div>
    </div>
  );
}

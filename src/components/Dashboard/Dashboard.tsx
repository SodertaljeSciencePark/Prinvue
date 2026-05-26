import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Printer, PrinterStats } from '../../Types';
import './Dashboard.css';

const MAX_HISTORY = 720;

interface TempHistoryPoint {
  time: string;
  nozzle: number;
  bed: number;
}

interface TempChartProps {
  data: TempHistoryPoint[];
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-time">{payload[0].payload.time}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="tooltip-row" style={{ color: item.color }}>
            <span className="tooltip-dot" style={{ backgroundColor: item.color }} />
            <span className="tooltip-label">{item.name}:</span>
            <span className="tooltip-value">{item.value}°C</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function TempChart({ data }: TempChartProps) {
  if (data.length < 2) {
    return <div className="temp-chart-empty">Collecting temperature data…</div>;
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid, rgba(255,255,255,0.03))" vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            interval={119} // Shows a tick roughly every 120 points (1 hour)
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['dataMin - 15', 'dataMax + 25']} 
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
          <Line
            name="Nozzle"
            type="monotone"
            dataKey="nozzle"
            stroke="var(--status-red)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            name="Bed"
            type="monotone"
            dataKey="bed"
            stroke="var(--status-yellow)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot nozzle" />
          <span className="legend-text">Nozzle ({data[data.length - 1]?.nozzle}°C)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot bed" />
          <span className="legend-text">Bed ({data[data.length - 1]?.bed}°C)</span>
        </div>
      </div>
    </div>
  );
}

const getServerUrl = () => {
  let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
};

interface Props {
  printer: Printer | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function Dashboard({ printer, onEdit, onDelete }: Props) {
  const [stats, setStats] = useState<PrinterStats | null>(null);
  const [history, setHistory] = useState<TempHistoryPoint[]>([]);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    if (!printer) return;
    
    setHistory([]);
    setCameraError(false);

    const fetchStats = async () => {
      try {
        const data: PrinterStats = await invoke('get_printer_stats', {
          serverUrl: getServerUrl(),
          id: printer.id,
        });
        console.log(`Fetched stats for ${printer.name}:`, data);
        setStats(data);
        
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setHistory(h => [
          ...h.slice(-(MAX_HISTORY - 1)),
          {
            time: timeString,
            nozzle: data.nozzleTemp ?? 0,
            bed: data.bedTemp ?? 0
          }
        ]);
      } catch (e) {
        console.error(`Failed fetching telemetry for ${printer.name}:`, e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [printer]);

  if (!printer) return null;

  const isPrinting =
    stats?.currentStatus?.toLowerCase().includes('print') ||
    (stats?.progressPercent ?? 0) > 0;

  const showCamera = printer.hasCamera !== false;

  return (
    <main className="dashboard">
      {/* Dashboard Top Header Control Ribbon */}
      <div className="dashboard-header">
        <div className="header-info-block">
          <h1 className="dashboard-title">{printer.name}</h1>
          <span className={`status-badge ${isPrinting ? 'printing' : 'idle'}`}>
            {stats?.currentStatus ?? 'OFFLINE'}
          </span>
        </div>
        <div className="action-buttons">
          <button className="btn-edit" onClick={onEdit}>Edit Setup</button>
          <button className="btn-delete" onClick={() => printer.id && onDelete(printer.id)}>
            Remove
          </button>
        </div>
      </div>

      {/* Synchronized Twin-Panel Split View layout Workspace */}
      <div className={`dashboard-main-split ${showCamera ? 'has-stream' : 'no-stream'}`}>
        
        {/* Stream Wing */}
        {showCamera && (
          <div className="dashboard-stream-frame">
            <div className="frame-header">
              <span className="live-dot" />
              <span className="frame-label">Live Broadcast Feed</span>
            </div>
            <div className="frame-viewport">
              {cameraError ? (
                <div 
                  className="camera-placeholder" 
                  onClick={() => setCameraError(false)}
                  style={{ cursor: 'pointer' }}
                  title="Click to retry connection"
                >
                  <span className="placeholder-icon">📷</span>
                  <span className="placeholder-text">Camera Feed Connection Failed</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>Click to retry</span>
                </div>
              ) : (
                <img
                  src={`${getServerUrl()}/api/v1/printers/${printer.id}/camera`}
                  alt="Live viewport stream"
                  onError={() => setCameraError(true)}
                />
              )}
            </div>
          </div>
        )}

        {/* Analytics Insights Data Stack Wing */}
        <div className="dashboard-analytics-frame">
          <div className="dashboard-stats-row">
            <div className="stat-card progress-card">
              <span className="stat-label">Job Completion Progress</span>
              <div className="stat-value">{stats?.progressPercent ?? 0}%</div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${stats?.progressPercent ?? 0}%` }}
                />
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-label">Active Nozzle</span>
              <span className="stat-value text-red">{stats?.nozzleTemp ?? 0}°C</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Heated Bed</span>
              <span className="stat-value text-yellow">{stats?.bedTemp ?? 0}°C</span>
            </div>
          </div>

          {/* Historical Recharts Graph inside same right-hand space block */}
          <div className="temp-chart-card">
            <span className="stat-label">Historical Analytics (Timeline)</span>
            <TempChart data={history} />
          </div>
        </div>

      </div>
    </main>
  );
}
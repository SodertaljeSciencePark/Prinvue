import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Printer, PrinterStats } from '../../Types';
import './PrinterCard.css';

const MAX_HISTORY = 720;

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="sparkline-placeholder" />;
  const W = 200, H = 28;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - 3 - ((v - min) / range) * (H - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="sparkline-svg">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MODEL_LABELS: Record<string, string> = {
  BAMBU_X_SERIES: 'X1',
  BAMBU_P_SERIES: 'P1S',
  PRUSA: 'Prusa',
};

const getServerUrl = () => {
  let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
};

interface Props {
  printer: Printer;
  onClick: () => void;
}

export default function PrinterCard({ printer, onClick }: Props) {
  const [stats, setStats] = useState<PrinterStats | null>(null);
  const [nozzleHistory, setNozzleHistory] = useState<number[]>([]);
  const [bedHistory, setBedHistory] = useState<number[]>([]);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    setCameraError(false);
    
    let tickCount = 0;

    const fetchStats = async () => {
      try {
        const data: PrinterStats = await invoke('get_printer_stats', {
          serverUrl: getServerUrl(),
          id: printer.id,
        });

        setStats(data);

        if (tickCount % 10 === 0) {
          setNozzleHistory(h => [...h.slice(-(MAX_HISTORY - 1)), data.nozzleTemp ?? 0]);
          setBedHistory(h => [...h.slice(-(MAX_HISTORY - 1)), data.bedTemp ?? 0]);
        }

        tickCount++;
      } catch (_) {
        setStats(prev => prev ? { ...prev, currentStatus: 'ERROR' } : null);
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, 3000);
    return () => clearInterval(id);
  }, [printer]);

  const isPrinting =
    stats?.currentStatus?.toLowerCase().includes('print') ||
    (stats?.progressPercent ?? 0) > 0;

  const showCamera = printer.hasCamera !== false;
  const modelLabel = MODEL_LABELS[printer.modelType] ?? printer.modelType;

  return (
    <div
      className={`printer-card ${isPrinting ? 'is-printing' : 'is-idle'}`}
      onClick={onClick}
    >
      <div className="printer-card-header">
        <div className="printer-card-title-row">
          <h3 className="printer-card-title">{printer.name}</h3>
          <span className="model-badge">{modelLabel}</span>
        </div>
        <span className={`status-badge ${isPrinting ? 'printing' : 'idle'}`}>
          {stats?.currentStatus ?? 'OFFLINE'}
        </span>
      </div>

      {showCamera && (
        <div className="printer-card-camera-top">
          {cameraError ? (
            <div 
              className="card-camera-error-placeholder" 
              onClick={(e) => {
                e.stopPropagation();
                setCameraError(false);
              }}
              style={{ cursor: 'pointer' }}
              title="Click to retry connection"
            >
              <span className="cam-icon">📷</span>
              <span>Camera Stream Offline</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>Click to retry</span>
            </div>
          ) : (
            <img
              src={`${getServerUrl()}/api/v1/printers/${printer.id}/camera`}
              alt={`Live feed – ${printer.name}`}
              onError={() => setCameraError(true)}
            />
          )}
        </div>
      )}

      <div className="printer-card-metrics-bottom">
        <div className="printer-card-stats">
          <div>
            <span className="stat-highlight">NZL</span>
            <span className="stat-value-sm">&nbsp;{stats?.nozzleTemp ?? 0}°C</span>
          </div>
          <div>
            <span className="stat-highlight">BED</span>
            <span className="stat-value-sm">&nbsp;{stats?.bedTemp ?? 0}°C</span>
          </div>
          <div>
            <span className="stat-highlight">PRG</span>
            <span className="stat-value-sm">&nbsp;{stats?.progressPercent ?? 0}%</span>
          </div>
        </div>

        <div className="sparkline-row">
          <div className="sparkline-item">
            <span className="sparkline-label">Nozzle</span>
            <Sparkline values={nozzleHistory} color="var(--status-red)" />
          </div>
          <div className="sparkline-item">
            <span className="sparkline-label">Bed</span>
            <Sparkline values={bedHistory} color="var(--status-yellow)" />
          </div>
        </div>
      </div>

      <div className="progress-bar-bg printer-card-progress">
        <div
          className="progress-bar-fill"
          style={{ width: `${stats?.progressPercent ?? 0}%` }}
        />
      </div>
    </div>
  );
}
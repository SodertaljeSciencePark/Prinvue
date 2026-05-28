import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Settings.css';

const THEMES = [
  { value: 'light',   label: 'Light' },
  { value: 'dark',    label: 'Dark (Default)' },
  { value: 'ocean',   label: 'Ocean' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'nord',    label: 'Nord' },
  { value: 'mocha',   label: 'Catppuccin Mocha' },
];

export default function Settings() {
    const [ip, setIp] = useState(localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [isRestarting, setIsRestarting] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleSave = () => {
        localStorage.setItem('serverUrl', ip);
        alert('Settings saved!');
    };

    const handleClearAllLogs = async () => {
        if (!confirm('Are you sure you want to clear ALL logs for ALL printers from the database?')) return;
        try {
            await invoke('clear_all_logs', { serverUrl: ip });
            alert('All logs cleared successfully!');
        } catch (e) {
            alert('Failed to clear logs: ' + e);
        }
    };

    const handleRestartServices = async () => {
        if (!confirm('Are you sure you want to restart the backend Docker services?')) return;
        setIsRestarting(true);
        try {
            const res: string = await invoke('restart_docker_services', { serverUrl: ip });
            alert(res);
        } catch (e) {
            alert('Failed to restart services: ' + e);
        } finally {
            setIsRestarting(false);
        }
    };

    return (
        <main className="settings-container">
            <div className="settings-wrapper">
                <h1>Settings</h1>

                <div className="settings-form">
                    <div className="settings-group">
                        <label>Server URL</label>
                        <input
                            type="text"
                            value={ip}
                            onChange={e => setIp(e.target.value)}
                            placeholder="e.g. http://192.168.1.100:8080"
                        />
                        <small>URL to the backend server including port number.</small>
                    </div>

                    <div className="settings-group">
                        <label>Application Theme</label>
                        <select
                            value={theme}
                            onChange={e => setTheme(e.target.value)}
                            className="model-select"
                        >
                            {THEMES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="save-btn" onClick={handleSave}>
                            Save Settings
                        </button>
                    </div>

                    <div className="danger-zone" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>Danger Zone</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                className="btn-clear-all" 
                                onClick={handleClearAllLogs}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Clear All Database Logs
                            </button>
                            <button 
                                className="btn-restart" 
                                onClick={handleRestartServices}
                                disabled={isRestarting}
                                style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                {isRestarting ? 'Restarting...' : 'Restart Docker Services'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
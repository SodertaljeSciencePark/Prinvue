import { useState, useEffect } from 'react';
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

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleSave = () => {
        localStorage.setItem('serverUrl', ip);
        alert('Settings saved!');
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

                    <button className="save-btn" onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </main>
    );
}
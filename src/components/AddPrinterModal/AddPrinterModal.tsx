import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Printer, PrinterModel } from '../../Types';
import './AddPrinterModal.css';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

const getServerUrl = () => {
  let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
};

export default function AddPrinterModal({ onClose, onAdded }: Props) {
  const [model, setModel] = useState<PrinterModel>(PrinterModel.BAMBU_X_SERIES);
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [serial, setSerial] = useState(''); 
  const [hasCamera, setHasCamera] = useState(model.includes('BAMBU'));
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      const newPrinter: Printer = {
        name,
        ip,
        modelType: model,
        username: model === PrinterModel.PRUSA ? username : undefined,
        accessCode: (model.includes('BAMBU') || model === PrinterModel.PRUSA) ? accessCode : undefined,
        access_code: (model.includes('BAMBU') || model === PrinterModel.PRUSA) ? accessCode : undefined,
        serial: model.includes('BAMBU') ? serial : undefined, 
        hasCamera: model.includes('BAMBU') ? true : hasCamera,
        has_camera: model.includes('BAMBU') ? true : hasCamera,
      };

      await invoke('add_printer', { serverUrl: getServerUrl(), printer: newPrinter });
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e as string);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Printer</h2>

        {error && <div className="error-box">{error}</div>}

        <label>Model</label>
        <select
          className="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value as PrinterModel)}
        >
          <option value={PrinterModel.BAMBU_X_SERIES}>Bambu Lab X-Series</option>
          <option value={PrinterModel.BAMBU_P_SERIES}>Bambu Lab P-Series</option>
          <option value={PrinterModel.PRUSA}>Prusa (Link)</option>
        </select>

        <label>Name</label>
        <input placeholder="e.g. My X1C" value={name} onChange={(e) => setName(e.target.value)} />

        <label>IP Address</label>
        <input placeholder="192.168.1.x" value={ip} onChange={(e) => setIp(e.target.value)} />

        {model.includes('BAMBU') && (
          <>
            <label>Serial Number</label>
            <input 
              type="text" 
              value={serial} 
              onChange={(e) => setSerial(e.target.value)} 
              placeholder="e.g. 01P00A..." 
              required 
            />
            <label>Access Code</label>
            <input
              type="text"
              placeholder="Ex: b67d3043"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </>
        )}

        {model.includes('PRUSA') && (
          <>
            <label>Username</label>
            <input
              placeholder="Ex: maker"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Ex: prusa1234"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </>
        )}

        <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={hasCamera}
            onChange={(e) => setHasCamera(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Has camera (Live video)
        </label>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
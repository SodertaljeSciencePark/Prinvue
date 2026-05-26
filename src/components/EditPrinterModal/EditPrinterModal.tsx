import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Printer, PrinterModel } from "../../Types";
import "../AddPrinterModal/AddPrinterModal.css";

interface Props {
  printer: Printer;
  onClose: () => void;
  onUpdated: (printer: Printer) => void;
}

const getServerUrl = () => {
  let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
};

export default function EditPrinterModal({ printer, onClose, onUpdated }: Props) {
  const [name, setName] = useState(printer.name);
  const [ip, setIp] = useState(printer.ip);
  const [username, setUsername] = useState(printer.username || "");
  const [accessCode, setAccessCode] = useState(printer.accessCode || printer.access_code || "");
  const [serial, setSerial] = useState(printer.serial || ""); 
  const [modelType, setModelType] = useState<PrinterModel>(printer.modelType);
  const [hasCamera, setHasCamera] = useState(printer.hasCamera !== false && printer.has_camera !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedPrinter: Printer = {
      id: printer.id,
      name,
      ip,
      username: modelType === PrinterModel.PRUSA ? username : undefined,
      accessCode,
      access_code: accessCode, // Send both to be safe
      modelType,
      serial: modelType.includes('BAMBU') ? serial : undefined,
      hasCamera,
      has_camera: hasCamera, // Send both to be safe
    };

    try {
      await invoke("update_printer", { serverUrl: getServerUrl(), printer: updatedPrinter });
      onUpdated(updatedPrinter);
      onClose();
    } catch (error) {
      console.error("Kunde inte uppdatera skrivare:", error);
      alert("Något gick fel när skrivaren skulle uppdateras.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Redigera Skrivare</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label>Modell</label>
          <select value={modelType} onChange={(e) => setModelType(e.target.value as PrinterModel)}>
            <option value={PrinterModel.BAMBU_X_SERIES}>Bambu Lab X-Series</option>
            <option value={PrinterModel.BAMBU_P_SERIES}>Bambu Lab P-Series</option>
            <option value={PrinterModel.PRUSA}>Prusa</option>
          </select>

          <label>Namn</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} />

          <label>IP-adress</label>
          <input required value={ip} onChange={(e) => setIp(e.target.value)} />

          {modelType.includes('BAMBU') && (
            <>
              <label>Serienummer (Serial)</label>
              <input 
                type="text" 
                value={serial} 
                onChange={(e) => setSerial(e.target.value)} 
                placeholder="T.ex. 01P00A..." 
                required 
              />
              <label>Access Code</label>
              <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
            </>
          )}

          {modelType.includes('PRUSA') && (
            <>
              <label>Username</label>
              <input placeholder="Ex: maker" value={username} onChange={(e) => setUsername(e.target.value)} />
              <label>Password</label>
              <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={hasCamera} 
              onChange={(e) => setHasCamera(e.target.checked)} 
            />
            Har kamera (Live-video)
          </label>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Avbryt
            </button>
            <button type="submit" className="save-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sparar..." : "Spara ändringar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
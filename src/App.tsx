import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import AddPrinterModal from "./components/AddPrinterModal/AddPrinterModal";
import { Printer } from "./Types";
import PrinterCard from "./components/Dashboard/PrinterCard";
import EditPrinterModal from "./components/EditPrinterModal/EditPrinterModal";
import Settings from "./components/Settings/Settings";
import Documentation from "./components/Documentation/Documentation";
import "./App.css";

type ViewState = 'overview' | 'settings' | 'docs';

function App() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('overview');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const getServerUrl = () => {
    let url = localStorage.getItem('serverUrl') || 'http://127.0.0.1:8080';
    if (url.endsWith('/')) url = url.slice(0, -1);
    return url;
  };

  const fetchPrinters = async () => {
    try {
      const url = getServerUrl();
      const data: Printer[] = await invoke("fetch_printers", { serverUrl: url });
      setPrinters(data);
    } catch (error) {
      console.error("Fel vid hämtning av skrivare:", error);
    }
  };

  const handleDeletePrinter = async (id: string) => {
    try {
      const url = getServerUrl();
      await invoke("delete_printer", { serverUrl: url, printerId: id });
      fetchPrinters();
      setSelectedPrinter(null);
    } catch (error) {
      console.error("Kunde inte radera skrivare:", error);
    }
  };

  const handleExport = async () => {
    try {
      const jsonText: string = await invoke('export_printers', { serverUrl: getServerUrl() });

      const blob = new Blob([jsonText], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `prinvue_export_${new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(blobUrl);
      setImportStatus({ type: 'success', message: 'Export successful!' });
      alert('Export successful!');
    } catch (err) {
      setImportStatus({ type: 'error', message: `Export failed: ${err}` });
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const jsonContent = await file.text();
      const message: string = await invoke('import_printers', {
        serverUrl: getServerUrl(),
        jsonContent,
      });
      setImportStatus({ type: 'success', message });
      fetchPrinters();
    } catch (err) {
      setImportStatus({ type: 'error', message: `Import failed: ${err}` });
    }

    setTimeout(() => setImportStatus(null), 4000);
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const renderContent = () => {
    if (currentView === 'settings') return <Settings />;
    if (currentView === 'docs') return <Documentation />;

    if (!selectedPrinter) {
      return (
        <main className="dashboard">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h1 className="dashboard-header" style={{ margin: 0 }}>Fleet Overview</h1>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {importStatus && (
                <span style={{
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  color: importStatus.type === 'success' ? 'var(--status-green)' : 'var(--status-red)',
                  border: `1px solid ${importStatus.type === 'success' ? 'var(--status-green)' : 'var(--status-red)'}`,
                  background: importStatus.type === 'success'
                    ? 'rgba(115,186,37,0.08)'
                    : 'rgba(209,81,81,0.08)',
                }}>
                  {importStatus.message}
                </span>
              )}

              <button className="io-btn" onClick={handleImportClick} title="Import printers from JSON">
                ↑ Import
              </button>
              <button className="io-btn io-btn--export" onClick={handleExport} title="Export printers to JSON">
                ↓ Export
              </button>

              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {printers.map(p => (
              <PrinterCard
                key={p.id}
                printer={p}
                onClick={() => setSelectedPrinter(p)}
              />
            ))}
            {printers.length === 0 && (
              <div style={{ color: 'var(--text-muted)' }}>Inga skrivare tillagda än. Klicka på + i menyn.</div>
            )}
          </div>
        </main>
      );
    }

    return (
      <Dashboard
        printer={selectedPrinter}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={handleDeletePrinter}
      />
    );
  };

  return (
    <div className="app-layout">
      <Sidebar
        printers={printers}
        selectedPrinter={selectedPrinter}
        onSelectPrinter={(printer) => {
          setSelectedPrinter(printer);
          setCurrentView('overview');
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        currentView={currentView}
        onChangeView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {renderContent()}

      {isAddModalOpen && (
        <AddPrinterModal onClose={() => setIsAddModalOpen(false)} onAdded={fetchPrinters} />
      )}

      {isEditModalOpen && selectedPrinter && (
        <EditPrinterModal
          printer={selectedPrinter}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={(updatedPrinter) => {
            setSelectedPrinter(updatedPrinter);
            fetchPrinters();
          }}
        />
      )}
    </div>
  );
}

export default App;
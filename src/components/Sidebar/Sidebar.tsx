import { Printer } from '../../Types';
import './Sidebar.css';
import { IoIosSettings } from "react-icons/io";
import { IoDocumentText } from "react-icons/io5";
import { FiChevronLeft, FiChevronRight, FiGrid, FiPrinter, FiPlus } from "react-icons/fi";

interface Props {
  printers: Printer[];
  selectedPrinter: Printer | null;
  onSelectPrinter: (printer: Printer | null) => void;
  onOpenAddModal: () => void;
  currentView: string;
  onChangeView: (view: 'overview' | 'settings' | 'docs' | 'logs') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ printers, selectedPrinter, onSelectPrinter, onOpenAddModal, currentView, onChangeView, isCollapsed, onToggleCollapse }: Props) {
  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">{isCollapsed ? 'P' : 'PRINVUE'}</div>
        <button className="collapse-btn" onClick={onToggleCollapse} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>

      <div className="nav-buttons">
        <button
          className={`view-all-btn ${(!selectedPrinter && currentView === 'overview') ? 'active' : ''}`}
          onClick={() => {
            onSelectPrinter(null);
            onChangeView('overview');
          }}
          title="Overview"
        >
          <FiGrid size={22} className="btn-icon" /> 
          {!isCollapsed && <span>Overview</span>}
        </button>
      </div>

      <ul className="printer-list">
        {printers.map((printer) => (
          <li
            key={printer.id}
            className={`printer-item ${selectedPrinter?.id === printer.id && currentView === 'overview' ? 'active' : ''}`}
            onClick={() => {
              onSelectPrinter(printer);
              onChangeView('overview');
            }}
            title={isCollapsed ? `${printer.name} (${printer.ip})` : undefined}
          >
            <div className="printer-icon">
              <FiPrinter size={20} />
            </div>
            {!isCollapsed && (
              <div className="printer-info">
                <div className="printer-name">{printer.name}</div>
                <div className="printer-ip">{printer.ip}</div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <button className="add-printer-btn" onClick={onOpenAddModal} title="Add Printer">
          <FiPlus size={24} className="btn-icon" /> 
          {!isCollapsed && <span>Add Printer</span>}
        </button>
      </div>
      
      <div className="sidebar-bottom-actions">
        <button 
          onClick={() => onChangeView('settings')}
          className={`bottom-icon-btn ${currentView === 'settings' ? 'active' : ''}`}
          title="Settings"
        >
          <IoIosSettings size={28} />
        </button>
        <button 
          onClick={() => onChangeView('docs')}
          className={`bottom-icon-btn ${currentView === 'docs' ? 'active' : ''}`}
          title="Documentation"
        >
          <IoDocumentText size={26} />
        </button>
      </div>
    </nav>
  );
}

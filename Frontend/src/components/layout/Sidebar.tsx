
import {
  LayoutDashboard,
  FolderSearch,
  Files,
  BrainCircuit,
  Clock3,
  Network,
  ShieldCheck,
  FileText,
  Settings,
  X,
} from "lucide-react";

type Page =
  | "dashboard"
  | "investigations"
  | "evidence"
  | "analysis"
  | "timeline"
  | "connections"
  | "integrity"
  | "reports"
  | "settings";

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    section: "WORKSPACE",
    items: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "investigations", label: "Investigations", icon: FolderSearch },
      { id: "evidence", label: "Evidence Vault", icon: Files },
      { id: "analysis", label: "AI Analysis", icon: BrainCircuit },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      { id: "timeline", label: "Incident Timeline", icon: Clock3 },
      { id: "connections", label: "Connections", icon: Network },
    ],
  },
  {
    section: "GOVERNANCE",
    items: [
      { id: "integrity", label: "Integrity & Audit", icon: ShieldCheck },
      { id: "reports", label: "Reports", icon: FileText },
    ],
  },
  {
    section: "SETTINGS",
    items: [{ id: "settings", label: "Settings", icon: Settings }],
  },
] as const;

export default function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">C</div>

          <div className="brand-info">
            <h2>ClueMatrix</h2>
            <span>EVIDENCE INTELLIGENCE</span>
          </div>

          <button className="sidebar-close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-navigation">
          {navigationItems.map((section) => (
            <div className="nav-section" key={section.section}>
              <p className="nav-section-title">{section.section}</p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="workspace-status">
            <span className="status-indicator" />
            <div>
              <strong>Workspace active</strong>
              <small>ClueMatrix environment</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

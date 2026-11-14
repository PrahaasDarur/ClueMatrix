import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import EvidenceVault from "./components/evidence/EvidenceVault";
import Dashboard from "./pages/Dashboard";
import Investigations from "./pages/Investigations";
import Login, { type UserRole } from "./pages/Login";
import {
  AnalysisPage,
  ConnectionsPage,
  TimelinePage,
} from "./pages/IntelligencePages";
import {
  IntegrityPage,
  ReportsPage,
  SettingsPage,
} from "./pages/GovernancePages";

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

type View = "home" | "login" | "workspace";

const pageTitles: Record<Page, string> = {
  dashboard: "Overview",
  investigations: "Investigations",
  evidence: "Evidence Vault",
  analysis: "AI Analysis",
  timeline: "Incident Timeline",
  connections: "Connections",
  integrity: "Integrity & Audit",
  reports: "Reports",
  settings: "Settings",
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [activeView, setActiveView] = useState<View>("home");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<
    Array<{ view: View; page: Page }>
  >([]);

  function navigateTo(view: View, page: Page = activePage) {
    setNavigationHistory((history) => [
      ...history,
      { view: activeView, page: activePage },
    ]);
    setActiveView(view);
    setActivePage(page);
    setSidebarOpen(false);
  }

  function goBack() {
    const previous = navigationHistory[navigationHistory.length - 1];

    if (!previous) return;

    setNavigationHistory((history) => history.slice(0, -1));
    setActiveView(previous.view);
    setActivePage(previous.page);
  }

  if (activeView === "home") {
    return (
      <main className="landing-page page-slide-in">
        <div className="landing-background" aria-hidden="true">
          <div className="landing-grid" />
          <div className="landing-orb landing-orb-blue" />
          <div className="landing-orb landing-orb-teal" />
          <div className="landing-orb landing-orb-violet" />
        </div>

        <section className="landing-content">
          <h1 className="landing-title">
            Clue<span>Matrix</span>
          </h1>

          <button
            className="landing-enter"
            onClick={() => navigateTo("login")}
          >
            Get started <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
    );
  }

  if (activeView === "login") {
    return (
      <Login
        selectedRole={selectedRole}
        onRoleSelect={setSelectedRole}
        onContinue={() => {
          if (selectedRole) navigateTo("workspace", "dashboard");
        }}
        onBack={() => navigateTo("home")}
      />
    );
  }

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "investigations":
        return <Investigations />;
      case "evidence":
        return <EvidenceVault />;
      case "analysis":
        return <AnalysisPage />;
      case "timeline":
        return <TimelinePage />;
      case "connections":
        return <ConnectionsPage />;
      case "integrity":
        return <IntegrityPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default: {
        const exhaustiveCheck: never = activePage;
        return exhaustiveCheck;
      }
    }
  }

  return (
    <div className="app-layout page-slide-in">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          if (page !== activePage) {
            navigateTo("workspace", page);
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <Topbar
          pageTitle={pageTitles[activePage]}
          currentRole={selectedRole}
          onMenuClick={() => setSidebarOpen(true)}
          onBackClick={goBack}
          onHomeClick={() => navigateTo("home")}
        />

        <div className="page-content page-slide-in" key={activePage}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

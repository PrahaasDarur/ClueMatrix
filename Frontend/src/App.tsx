import Investigations from "./pages/Investigations";
import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import Login, { type UserRole } from "./pages/Login";

import {
  FolderSearch,
  Files,
  BrainCircuit,
  Clock3,
  Network,
  ShieldCheck,
  FileText,
} from "lucide-react";

type Page =
  | "dashboard"
  | "investigations"
  | "evidence"
  | "analysis"
  | "timeline"
  | "connections"
  | "integrity"
  | "reports";

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
};

const pageDetails = {
  investigations: {
    icon: FolderSearch,
    title: "Investigations",
    description: "Create and manage your digital incident workspaces.",
  },
  evidence: {
    icon: Files,
    title: "Evidence Vault",
    description: "Upload and organize screenshots, emails, documents, and other evidence.",
  },
  analysis: {
    icon: BrainCircuit,
    title: "AI Analysis",
    description: "Extract entities, information, and contextual relationships from evidence.",
  },
  timeline: {
    icon: Clock3,
    title: "Incident Timeline",
    description: "Reconstruct chronological incident sequences using source-linked events.",
  },
  connections: {
    icon: Network,
    title: "Connections",
    description: "Visualize relationships between people, conversations, and events.",
  },
  integrity: {
    icon: ShieldCheck,
    title: "Integrity & Audit",
    description: "Review SHA-256 fingerprints and evidence activity records.",
  },
  reports: {
    icon: FileText,
    title: "Reports",
    description: "Prepare structured incident summaries with supporting evidence references.",
  },
};

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [activeView, setActiveView] = useState<View>("home");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<
    Array<{ view: View; page: Page }>
  >([]);

  function navigateTo(view: View, page = activePage) {
    setNavigationHistory((history) => [...history, { view: activeView, page: activePage }]);
    setActiveView(view);
    setActivePage(page);
  }

  function goBack() {
    const previousLocation = navigationHistory[navigationHistory.length - 1];
    if (!previousLocation) {
      return;
    }

    setNavigationHistory((history) => history.slice(0, -1));
    setActiveView(previousLocation.view);
    setActivePage(previousLocation.page);
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
            Get started
            <span aria-hidden="true">→</span>
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
          if (selectedRole) {
            navigateTo("workspace", "dashboard");
          }
        }}
        onBack={() => navigateTo("home")}
      />
    );
  }

  const renderPage = () => {
    if (activePage === "dashboard") {
      return <Dashboard />;
    }

    if (activePage === "investigations") {
      return <Investigations />;
    }

    const details = pageDetails[activePage];

    return (
      <div className="placeholder-page">
        <div className="placeholder-icon">
          <details.icon size={30} />
        </div>
        <span className="eyebrow">CLUE MATRIX WORKSPACE</span>
        <h1>{details.title}</h1>
        <p>{details.description}</p>
        <div className="coming-soon">Module under development</div>
      </div>
    );
  };

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

        <div
          className="page-content page-slide-in"
          key={activePage}
        >
          {renderPage()}
        </div>

      </main>

    </div>
  );
}

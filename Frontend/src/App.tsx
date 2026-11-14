import Investigations from "./pages/Investigations";
import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";

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
  const [showHome, setShowHome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<
    Array<{ isHome: boolean; page: Page }>
  >([]);

  function navigateTo(isHome: boolean, page = activePage) {
    setNavigationHistory((history) => [...history, { isHome: showHome, page: activePage }]);
    setShowHome(isHome);
    setActivePage(page);
  }

  function goBack() {
    const previousLocation = navigationHistory[navigationHistory.length - 1];
    if (!previousLocation) {
      return;
    }

    setNavigationHistory((history) => history.slice(0, -1));
    setShowHome(previousLocation.isHome);
    setActivePage(previousLocation.page);
  }

  if (showHome) {
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
            onClick={() => navigateTo(false)}
          >
            Enter workspace
            <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>
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
            navigateTo(false, page);
          }
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">

        <Topbar
          pageTitle={pageTitles[activePage]}
          onMenuClick={() => setSidebarOpen(true)}
          onBackClick={goBack}
          onHomeClick={() => navigateTo(true)}
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

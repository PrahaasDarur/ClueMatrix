import {
  FolderSearch,
  Files,
  BrainCircuit,
  Clock3,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Plus,
  FileText,
} from "lucide-react";

const stats = [
  { label: "Investigations", value: "08", change: "Active workspaces", icon: FolderSearch },
  { label: "Evidence files", value: "24", change: "Across investigations", icon: Files },
  { label: "Entities extracted", value: "156", change: "Sample analysis data", icon: BrainCircuit },
  { label: "Integrity checks", value: "24", change: "Fingerprints calculated", icon: ShieldCheck },
];

const investigations = [
  { id: "INV-001", name: "Online Harassment Case", category: "Cyber Harassment", evidence: 8, status: "Active" },
  { id: "INV-002", name: "Financial Fraud Investigation", category: "Financial Fraud", evidence: 6, status: "Processing" },
  { id: "INV-003", name: "Digital Identity Theft", category: "Identity Theft", evidence: 5, status: "Active" },
];

const activities = [
  { title: "Evidence uploaded", description: "email_export.pdf", time: "Today · 09:30 AM", icon: Files },
  { title: "Analysis completed", description: "Entity extraction finished", time: "Today · 10:15 AM", icon: BrainCircuit },
  { title: "Fingerprint calculated", description: "chat_screenshot.png", time: "Yesterday · 04:20 PM", icon: ShieldCheck },
  { title: "Investigation created", description: "Online Harassment Case", time: "Yesterday · 11:00 AM", icon: FolderSearch },
];

export default function Dashboard() {
  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">WORKSPACE OVERVIEW</span>
          <h1>Good to see you again.</h1>
          <p>Monitor investigations, evidence and intelligence activity.</p>
        </div>
        <span className="dashboard-live"><Activity size={15} /> Workspace overview</span>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article className="dashboard-stat-card" key={stat.label}>
              <div className="dashboard-stat-top">
                <span>{stat.label}</span>
                <Icon size={20} />
              </div>
              <strong>{stat.value}</strong>
              <small>{stat.change}</small>
            </article>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-investigations">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent investigations</h2>
              <p>Your latest investigation workspaces</p>
            </div>
            <FolderSearch size={21} />
          </div>

          {investigations.map((item) => (
            <article className="dashboard-investigation" key={item.id}>
              <div className="dashboard-investigation-icon">
                <FolderSearch size={19} />
              </div>
              <div className="dashboard-investigation-info">
                <strong>{item.name}</strong>
                <span>{item.id} · {item.category}</span>
                <small>{item.evidence} evidence files</small>
              </div>
              <span className={`status-pill ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </article>
          ))}

          <p className="evidence-disclaimer">
            Demonstration records. Connect the investigations API for live data.
          </p>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Latest workspace events</p>
            </div>
            <Clock3 size={21} />
          </div>

          <div className="dashboard-activity-list">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <article className="dashboard-activity" key={index}>
                  <div className="dashboard-activity-icon">
                    <Icon size={17} />
                  </div>
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.description}</span>
                    <small>{activity.time}</small>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="dashboard-panel dashboard-quick-actions">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Workspace capabilities</h2>
            <p>Core ClueMatrix modules</p>
          </div>
          <ArrowUpRight size={21} />
        </div>

        <div className="dashboard-action-grid">
          <article><Plus size={20} /><strong>Investigations</strong><span>Create and organize cases</span></article>
          <article><Files size={20} /><strong>Evidence Vault</strong><span>Upload and manage evidence</span></article>
          <article><BrainCircuit size={20} /><strong>AI Intelligence</strong><span>Extract entities and insights</span></article>
          <article><FileText size={20} /><strong>Reports</strong><span>Prepare incident summaries</span></article>
        </div>
      </section>

      <p className="evidence-disclaimer">
        Dashboard statistics and activity are currently sample data and are not live backend metrics.
      </p>
    </section>
  );
}


import {
  FolderOpen,
  Files,
  Clock3,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  FileSearch,
  BrainCircuit,
  Network,
  Activity,
  MoreHorizontal,
} from "lucide-react";

const statistics = [
  {
    label: "Active Investigations",
    value: "03",
    description: "Across your workspace",
    icon: FolderOpen,
    color: "blue",
  },
  {
    label: "Evidence Files",
    value: "16",
    description: "Registered in demo data",
    icon: Files,
    color: "cyan",
  },
  {
    label: "Timeline Events",
    value: "12",
    description: "Illustrative extracted events",
    icon: Clock3,
    color: "purple",
  },
  {
    label: "Integrity Checks",
    value: "16",
    description: "Illustrative verification count",
    icon: ShieldCheck,
    color: "green",
  },
];

const investigations = [
  {
    id: "CM-024",
    name: "Social Platform Harassment",
    category: "Online Harassment",
    evidence: 8,
    status: "Analysis Complete",
    statusType: "completed",
    updated: "Today, 10:42 AM",
  },
  {
    id: "CM-023",
    name: "Payment Impersonation",
    category: "Fraud",
    evidence: 5,
    status: "In Review",
    statusType: "review",
    updated: "Yesterday",
  },
  {
    id: "CM-021",
    name: "Repeated Contact Pattern",
    category: "Stalking",
    evidence: 3,
    status: "Evidence Collected",
    statusType: "collected",
    updated: "Nov 11, 2026",
  },
];

const activities = [
  {
    title: "Evidence registered",
    description: "message-thread-01.png",
    time: "Today · 10:42 AM",
    icon: Files,
  },
  {
    title: "Investigation created",
    description: "CM-024 · Social Platform Harassment",
    time: "Today · 10:35 AM",
    icon: FolderOpen,
  },
  {
    title: "Integrity fingerprint calculated",
    description: "SHA-256 · Demo evidence",
    time: "Today · 10:30 AM",
    icon: ShieldCheck,
  },
];

const features = [
  {
    number: "01",
    title: "Smart Evidence Extraction",
    description:
      "Extract important information from screenshots, documents, emails, and other digital files.",
    icon: FileSearch,
    color: "blue",
  },
  {
    number: "02",
    title: "Intelligent Timeline & Mapping",
    description:
      "Connect related clues, identify contextual relationships, and reconstruct incident events.",
    icon: Network,
    color: "cyan",
  },
  {
    number: "03",
    title: "Evidence Integrity Verification",
    description:
      "Use SHA-256 fingerprints to detect changes to evidence files.",
    icon: ShieldCheck,
    color: "green",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* PAGE HEADING */}

      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">INTELLIGENCE WORKSPACE</p>

          <h1>Evidence, connected.</h1>

          <p className="heading-description">
            Organize digital evidence, connect clues, and
            reconstruct incident sequences.
          </p>
        </div>

        <button className="primary-button">
          <Plus size={18} />
          New Investigation
        </button>
      </section>

      {/* STATISTICS */}

      <section className="statistics-grid">

        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>

              <div className="stat-card-top">
                <span>{stat.label}</span>

                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={19} />
                </div>
              </div>

              <h2>{stat.value}</h2>

              <p>{stat.description}</p>

            </div>
          );
        })}

      </section>

      {/* MAIN CONTENT */}

      <section className="dashboard-main-grid">

        {/* RECENT INVESTIGATIONS */}

        <div className="dashboard-panel">

          <div className="panel-heading">
            <div>
              <h2>Recent Investigations</h2>
              <p>Your latest investigation workspaces</p>
            </div>

            <button className="icon-button" aria-label="More options">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="investigation-list">

            {investigations.map((item) => (

              <div className="investigation-row" key={item.id}>

                <div className="investigation-main">

                  <div className="investigation-icon">
                    <FolderOpen size={19} />
                  </div>

                  <div>
                    <h3>{item.name}</h3>

                    <p>
                      {item.id}
                      <span>·</span>
                      {item.category}
                    </p>

                    <small>
                      {item.evidence} evidence files · {item.updated}
                    </small>
                  </div>

                </div>

                <span className={`status-badge ${item.statusType}`}>
                  {item.status}
                </span>

              </div>

            ))}

          </div>

          <button className="text-button">
            View all investigations
            <ArrowUpRight size={15} />
          </button>

        </div>

        {/* RECENT ACTIVITY */}

        <div className="dashboard-panel">

          <div className="panel-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest workspace actions</p>
            </div>

            <Activity size={19} className="muted-icon" />
          </div>

          <div className="activity-list">

            {activities.map((activity, index) => {
              const Icon = activity.icon;

              return (
                <div className="activity-item" key={index}>

                  <div className="activity-icon">
                    <Icon size={17} />
                  </div>

                  <div>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                    <small>{activity.time}</small>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* CORE FEATURES */}

      <section className="features-section">

        <div className="section-heading">
          <div>
            <p className="eyebrow">PLATFORM CAPABILITIES</p>
            <h2>Digital evidence intelligence</h2>
          </div>
        </div>

        <div className="features-grid">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div className="feature-card" key={feature.number}>

                <div className="feature-card-top">

                  <div className={`feature-icon ${feature.color}`}>
                    <Icon size={22} />
                  </div>

                  <span>{feature.number}</span>

                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

              </div>
            );
          })}

        </div>

      </section>

      {/* DEMO DATA DISCLAIMER */}

      <div className="demo-notice">
        <BrainCircuit size={17} />

        <p>
          Demonstration workspace — statistics, activity, and
          investigation records currently use synthetic data.
          AI findings require verification against original evidence.
        </p>

      </div>

    </div>
  );
}

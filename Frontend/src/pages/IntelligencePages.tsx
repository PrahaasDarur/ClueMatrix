import { useState } from "react";
import {
  BrainCircuit,
  Clock3,
  Network,
  Search,
  UserRound,
  Building2,
  MapPin,
  CalendarDays,
  FileText,
  ArrowRight,
} from "lucide-react";

const sampleEntities = [
  { name: "John Smith", type: "PERSON", source: "email_export.pdf", confidence: "Review" },
  { name: "Acme Technologies", type: "ORG", source: "contract.pdf", confidence: "Review" },
  { name: "Bangalore", type: "LOCATION", source: "chat_screenshot.png", confidence: "Review" },
  { name: "12 November 2026", type: "DATE", source: "email_export.pdf", confidence: "Review" },
  { name: "john@example.com", type: "EMAIL", source: "email_export.pdf", confidence: "Review" },
];

const sampleEvents = [
  { date: "12 Nov 2026", time: "09:30 AM", title: "Initial email received", source: "email_export.pdf", detail: "An email was received from the identified contact." },
  { date: "12 Nov 2026", time: "11:15 AM", title: "Chat conversation", source: "chat_screenshot.png", detail: "A conversation screenshot was added to the investigation." },
  { date: "13 Nov 2026", time: "02:00 PM", title: "Document uploaded", source: "contract.pdf", detail: "A PDF document was added for analysis." },
];

export function AnalysisPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = sampleEntities.filter((entity) =>
    entity.name.toLowerCase().includes(query.toLowerCase()) &&
    (category === "ALL" || entity.type === category)
  );

  const entityIcon = (type: string) => {
    if (type === "PERSON") return <UserRound size={18} />;
    if (type === "ORG") return <Building2 size={18} />;
    if (type === "LOCATION") return <MapPin size={18} />;
    if (type === "DATE") return <CalendarDays size={18} />;
    return <FileText size={18} />;
  };

  return (
    <section className="case-workspace">
      <div className="case-panel-heading">
        <div>
          <h2>AI Analysis</h2>
          <p>Explore entities extracted from digital evidence.</p>
        </div>
        <BrainCircuit size={28} />
      </div>

      <div className="case-overview-grid">
        <div className="case-overview-card"><span>Extracted entities</span><strong>{sampleEntities.length}</strong></div>
        <div className="case-overview-card"><span>Entity categories</span><strong>5</strong></div>
        <div className="case-overview-card"><span>Sources represented</span><strong>3</strong></div>
        <div className="case-overview-card"><span>Needs review</span><strong>{sampleEntities.length}</strong></div>
      </div>

      <div className="integrity-explainer">
        <BrainCircuit size={21} />
        <div>
          <strong>Entity extraction workspace</strong>
          <p>Review people, organizations, locations, dates and contact details. These are demonstration records, not live analysis results.</p>
        </div>
      </div>

      <div className="vault-toolbar">
        <div className="vault-search">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search extracted entities..." />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="ALL">All categories</option>
          <option value="PERSON">People</option>
          <option value="ORG">Organizations</option>
          <option value="LOCATION">Locations</option>
          <option value="DATE">Dates</option>
          <option value="EMAIL">Emails</option>
        </select>
      </div>

      <div className="evidence-list">
        {filtered.map((entity, index) => (
          <article className="evidence-item" key={`${entity.name}-${index}`}>
            <div className="evidence-file-icon">{entityIcon(entity.type)}</div>
            <div className="evidence-file-info">
              <strong>{entity.name}</strong>
              <span>{entity.type} · Source: {entity.source}</span>
            </div>
            <span className="status-pill">{entity.confidence}</span>
          </article>
        ))}
        {filtered.length === 0 && <p className="evidence-empty">No matching entities.</p>}
      </div>
    </section>
  );
}

export function TimelinePage() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="case-workspace">
      <div className="case-panel-heading">
        <div>
          <h2>Incident Timeline</h2>
          <p>Review events in chronological order and inspect their source records.</p>
        </div>
        <Clock3 size={28} />
      </div>

      <div className="integrity-explainer">
        <Clock3 size={21} />
        <div>
          <strong>Chronological reconstruction</strong>
          <p>Demonstration events below illustrate the timeline interface. Actual events will be generated from extracted evidence.</p>
        </div>
      </div>

      <div className="timeline-list">
        {sampleEvents.map((event, index) => (
          <button
            className={`timeline-event ${selected === index ? "active" : ""}`}
            key={event.title}
            onClick={() => setSelected(selected === index ? null : index)}
          >
            <div className="timeline-marker"><span /></div>
            <div className="timeline-event-content">
              <span>{event.date} · {event.time}</span>
              <strong>{event.title}</strong>
              <small>Source: {event.source}</small>
              {selected === index && <p>{event.detail}</p>}
            </div>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
    </section>
  );
}

export function ConnectionsPage() {
  const [selected, setSelected] = useState("John Smith");

  const nodes = [
    { name: "John Smith", type: "Person", related: "john@example.com" },
    { name: "Acme Technologies", type: "Organization", related: "John Smith" },
    { name: "Bangalore", type: "Location", related: "Acme Technologies" },
    { name: "john@example.com", type: "Email", related: "John Smith" },
  ];

  const current = nodes.find((node) => node.name === selected);

  return (
    <section className="case-workspace">
      <div className="case-panel-heading">
        <div>
          <h2>Evidence Connections</h2>
          <p>Explore relationships between entities found in evidence.</p>
        </div>
        <Network size={28} />
      </div>

      <div className="integrity-explainer">
        <Network size={21} />
        <div>
          <strong>Relationship exploration</strong>
          <p>These sample associations demonstrate the interface only. They are not verified relationships or conclusions.</p>
        </div>
      </div>

      <div className="connection-layout">
        <div className="connection-node-list">
          {nodes.map((node) => (
            <button
              key={node.name}
              className={`connection-node ${selected === node.name ? "active" : ""}`}
              onClick={() => setSelected(node.name)}
            >
              <Network size={17} />
              <span><strong>{node.name}</strong><small>{node.type}</small></span>
            </button>
          ))}
        </div>

        <div className="connection-detail">
          <span className="eyebrow">SELECTED ENTITY</span>
          <h3>{current?.name}</h3>
          <p>Entity type: {current?.type}</p>
          <div className="integrity-explainer">
            <ArrowRight size={18} />
            <div><strong>Sample association</strong><p>{current?.related}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

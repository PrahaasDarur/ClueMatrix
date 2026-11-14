import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Settings,
  Copy,
  Download,
  UserRound,
  LockKeyhole,
  Bell,
} from "lucide-react";

const sampleAudit = [
  { action: "Evidence uploaded", item: "email_export.pdf", time: "12 Nov 2026 · 09:30 AM", status: "Recorded" },
  { action: "SHA-256 calculated", item: "email_export.pdf", time: "12 Nov 2026 · 09:30 AM", status: "Recorded" },
  { action: "Evidence uploaded", item: "chat_screenshot.png", time: "12 Nov 2026 · 11:15 AM", status: "Recorded" },
];

export function IntegrityPage() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const demoHash = "a3f5c8e2d91b7640f2a6e8c1b4d7f903a3f5c8e2d91b7640f2a6e8c1b4d7f903";

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(demoHash);
      setCopyError("");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError("Could not copy the hash. Check clipboard permissions.");
    }
  }

  return (
    <section className="case-workspace">
      <div className="case-panel-heading">
        <div>
          <h2>Integrity & Audit</h2>
          <p>Review file fingerprints and evidence activity.</p>
        </div>
        <ShieldCheck size={28} />
      </div>

      <div className="case-overview-grid">
        <div className="case-overview-card"><span>Sample audit events</span><strong>{sampleAudit.length}</strong></div>
        <div className="case-overview-card"><span>Hash algorithm</span><strong>SHA-256</strong></div>
        <div className="case-overview-card"><span>Verification checks</span><strong>Not run</strong></div>
      </div>

      <div className="integrity-explainer">
        <ShieldCheck size={21} />
        <div>
          <strong>Cryptographic integrity</strong>
          <p>A matching SHA-256 digest indicates matching file contents. It does not independently prove origin, authenticity or chain of custody.</p>
        </div>
      </div>

      <div className="case-panel">
        <h3>Example fingerprint</h3>
        <p className="evidence-hash"><code>{demoHash}</code></p>
        <button className="secondary-button" onClick={copyHash}><Copy size={15} />{copied ? "Copied" : "Copy hash"}</button>
        {copyError && <p className="governance-error" role="alert">{copyError}</p>}
        <p className="evidence-disclaimer">Demonstration value only. This is not a fingerprint from an uploaded evidence file.</p>
      </div>

      <h3>Activity log</h3>
      <div className="evidence-list">
        {sampleAudit.map((event, index) => (
          <article className="evidence-item" key={index}>
            <div className="evidence-file-icon"><ShieldCheck size={19} /></div>
            <div className="evidence-file-info">
              <strong>{event.action}</strong>
              <span>{event.item} · {event.time}</span>
            </div>
            <span className="status-pill">{event.status}</span>
          </article>
        ))}
      </div>
      <p className="evidence-disclaimer">Sample activity for interface demonstration. A tamper-evident audit log has not yet been implemented.</p>
    </section>
  );
}

export function ReportsPage() {
  const [reportTitle, setReportTitle] = useState("Incident Summary");
  const [includeEntities, setIncludeEntities] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [generated, setGenerated] = useState(false);

  function downloadReport() {
    const content = [
      "CLUEMATRIX — INCIDENT SUMMARY",
      `Report: ${reportTitle}`,
      "",
      "DEMONSTRATION REPORT — SAMPLE DATA ONLY",
      "",
      includeEntities ? "Extracted entities: Sample entity records would appear here." : "",
      includeTimeline ? "Incident timeline: Sample chronological events would appear here." : "",
      includeSources ? "Evidence references: Source-linked evidence records would appear here." : "",
      "",
      "This report is a frontend demonstration, not a verified investigative finding.",
    ].filter(Boolean).join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cluematrix-incident-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
    setGenerated(true);
  }

  return (
    <section className="case-workspace">
      <div className="case-panel-heading">
        <div>
          <h2>Reports</h2>
          <p>Prepare structured summaries of investigation findings.</p>
        </div>
        <FileText size={28} />
      </div>

      <div className="case-panel report-form">
        <label htmlFor="report-title">Report title</label>
        <input id="report-title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />

        <h3>Include sections</h3>
        <label><input type="checkbox" checked={includeEntities} onChange={(e) => setIncludeEntities(e.target.checked)} /> Extracted entities</label>
        <label><input type="checkbox" checked={includeTimeline} onChange={(e) => setIncludeTimeline(e.target.checked)} /> Incident timeline</label>
        <label><input type="checkbox" checked={includeSources} onChange={(e) => setIncludeSources(e.target.checked)} /> Evidence references</label>

        <button className="primary-button" onClick={downloadReport} disabled={!reportTitle.trim()}>
          <Download size={17} /> Export demonstration report
        </button>
        {generated && <p role="status">Report exported as a text file.</p>}
      </div>

      <p className="evidence-disclaimer">This export currently contains a demonstration template. PDF generation and live investigation data will be connected later.</p>
    </section>
  );
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [compact, setCompact] = useState(false);
  const [displayName, setDisplayName] = useState("Workspace User");

  return (
    <section className="case-workspace">
      <div className="case-panel-heading">
        <div><h2>Settings</h2><p>Manage your workspace preferences.</p></div>
        <Settings size={28} />
      </div>

      <div className="case-panel settings-section">
        <h3><UserRound size={19} /> Profile</h3>
        <label htmlFor="display-name">Display name</label>
        <input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>

      <div className="case-panel settings-section">
        <h3><Bell size={19} /> Notifications</h3>
        <label><input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} /> Enable workspace notifications</label>
      </div>

      <div className="case-panel settings-section">
        <h3><LockKeyhole size={19} /> Appearance</h3>
        <label><input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Compact layout preference</label>
      </div>

      <p className="evidence-disclaimer">These preferences are currently local to this screen and are not persisted to a user account.</p>
    </section>
  );
}

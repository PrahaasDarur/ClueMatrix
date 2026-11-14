import { useRef, useState } from "react";
import {
  ArrowLeft,
  FolderSearch,
  Files,
  ShieldCheck,
  Clock3,
  Network,
  BrainCircuit,
  Upload,
  FileText,
  Image,
  Music,
  Video,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AnalysisPanel from "../components/analysis/AnalysisPanel";
import type { Investigation } from "./Investigations";

interface InvestigationDetailProps {
  investigation: Investigation;
  onBack: () => void;
}

interface EvidenceRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  addedAt: string;
}

type WorkspaceTab = "evidence" | "timeline" | "connections" | "analysis";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("audio/")) return Music;
  if (type.startsWith("video/")) return Video;
  return FileText;
}

export default function InvestigationDetail({
  investigation,
  onBack,
}: InvestigationDetailProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("evidence");
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError("");
    setIsProcessing(true);

    try {
      const newRecords: EvidenceRecord[] = [];

      for (const file of Array.from(files)) {
        const buffer = await file.arrayBuffer();
        const digest = await crypto.subtle.digest("SHA-256", buffer);

        const hash = Array.from(new Uint8Array(digest))
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");

        newRecords.push({
          id: `${file.name}-${file.lastModified}-${file.size}`,
          name: file.name,
          size: file.size,
          type: file.type || "Unknown file type",
          hash,
          addedAt: new Date().toLocaleString(),
        });
      }

      setEvidence((current) => [...newRecords, ...current]);
    } catch {
      setError(
        "Could not calculate the file fingerprint. Try another file or browser.",
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const tabs = [
    { id: "evidence", label: "Evidence", icon: Files },
    { id: "timeline", label: "Timeline", icon: Clock3 },
    { id: "connections", label: "Connections", icon: Network },
    { id: "analysis", label: "AI Analysis", icon: BrainCircuit },
  ] as const;

  return (
    <section className="case-workspace">
      <button className="back-to-cases" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to investigations
      </button>

      <div className="case-heading">
        <div className="case-heading-icon">
          <FolderSearch size={25} />
        </div>

        <div className="case-heading-info">
          <div className="case-id-label">
            INVESTIGATION / {investigation.id}
          </div>
          <h1>{investigation.title}</h1>
          <p>{investigation.category}</p>
        </div>

        <span
          className={`status-pill ${investigation.status
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {investigation.status}
        </span>
      </div>

      <div className="case-overview-grid">
        <div className="case-overview-card">
          <span>Case ID</span>
          <strong>{investigation.id}</strong>
        </div>
        <div className="case-overview-card">
          <span>Evidence registered</span>
          <strong>{investigation.evidenceCount + evidence.length}</strong>
        </div>
        <div className="case-overview-card">
          <span>Evidence added in this session</span>
          <strong>{evidence.length}</strong>
        </div>
        <div className="case-overview-card">
          <span>Integrity fingerprints</span>
          <strong>{evidence.length}</strong>
        </div>
      </div>

      <div className="case-tabs" role="tablist" aria-label="Case workspace">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={`case-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "evidence" && (
        <div className="case-panel" role="tabpanel">
          <div className="case-panel-heading">
            <div>
              <h2>Evidence Vault</h2>
              <p>
                Register files and calculate their SHA-256 fingerprints.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload size={17} />
              {isProcessing ? "Processing..." : "Add evidence"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => handleFiles(event.target.files)}
            />
          </div>

          <div className="integrity-explainer">
            <ShieldCheck size={21} />
            <div>
              <strong>SHA-256 fingerprinting</strong>
              <p>
                Each selected file is hashed locally in your browser. The
                fingerprint can help detect whether the file changes later.
              </p>
            </div>
          </div>

          {error && (
            <div className="evidence-error" role="alert">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {evidence.length === 0 ? (
            <div className="evidence-empty">
              <div className="evidence-empty-icon">
                <Upload size={27} />
              </div>
              <h3>No new evidence registered in this session</h3>
              <p>
                Add screenshots, documents, audio, or other files to calculate
                their SHA-256 fingerprints.
              </p>
              <button
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                Select files
              </button>
            </div>
          ) : (
            <div className="evidence-list">
              {evidence.map((item) => {
                const Icon = getFileIcon(item.type);

                return (
                  <article className="evidence-item" key={item.id}>
                    <div className="evidence-file-icon">
                      <Icon size={21} />
                    </div>

                    <div className="evidence-file-info">
                      <strong>{item.name}</strong>
                      <span>
                        {formatBytes(item.size)} · {item.type}
                      </span>
                      <div className="evidence-hash">
                        <span>SHA-256</span>
                        <code>{item.hash}</code>
                      </div>
                    </div>

                    <div className="hash-verified">
                      <CheckCircle2 size={17} />
                      <span>Hash calculated</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="evidence-disclaimer">
            Session-only demonstration: files are not uploaded or persistently
            stored. A calculated hash is not proof of authenticity or
            chain-of-custody compliance.
          </p>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="case-panel coming-module" role="tabpanel">
          <Clock3 size={30} />
          <h2>Incident Timeline</h2>
          <p>
            Extracted events will appear here in chronological order, linked
            to their original evidence sources.
          </p>
          <span>Timeline module under development</span>
        </div>
      )}

      {activeTab === "connections" && (
        <div className="case-panel coming-module" role="tabpanel">
          <Network size={30} />
          <h2>Evidence Connections</h2>
          <p>
            People, accounts, phone numbers, messages, and other entities will
            be connected here.
          </p>
          <span>Connection graph under development</span>
        </div>
      )}

      {activeTab === "analysis" && (
        <AnalysisPanel evidence={evidence} />
      )}
    </section>
  );
}

import { useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  Upload,
  Search,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  X,
  Copy,
  Files,
  RefreshCw,
} from "lucide-react";
import { uploadEvidence } from "../../services/evidenceService";

type EvidenceStatus = "RECEIVED" | "PROCESSING" | "COMPLETE" | "FAILED";
type EvidenceFilter = "ALL" | "PDF" | "IMAGE";

interface EvidenceRecord {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  addedAt: string;
  status: EvidenceStatus;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

function getErrorMessage(error: unknown) {
  if (isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? error.message;
  }
  return error instanceof Error ? error.message : "Upload failed.";
}

async function calculateSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getFileIcon(type: string) {
  return type.startsWith("image/") ? ImageIcon : FileText;
}

function getStatusLabel(status: EvidenceStatus) {
  switch (status) {
    case "RECEIVED":
      return "Received";
    case "PROCESSING":
      return "Processing";
    case "COMPLETE":
      return "Analysis complete";
    case "FAILED":
      return "Analysis failed";
  }
}

export default function EvidenceVault() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceRecord | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EvidenceFilter>("ALL");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setError("");
    setSuccessMessage("");
    setIsUploading(true);

    const failures: string[] = [];
    let successfulUploads = 0;

    try {
      for (const file of Array.from(files)) {
        if (!/\.(jpe?g|png|pdf)$/i.test(file.name)) {
          failures.push(`${file.name}: unsupported file format.`);
          continue;
        }

        try {
          const hash = await calculateSHA256(file);
          const result = await uploadEvidence(file);

          const record: EvidenceRecord = {
            id: result.evidence_id,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            hash,
            addedAt: new Date().toISOString(),
            status: "RECEIVED",
          };

          setEvidence((current) => [record, ...current]);
          successfulUploads++;
        } catch (uploadError) {
          failures.push(`${file.name}: ${getErrorMessage(uploadError)}`);
        }
      }

      if (successfulUploads > 0) {
        setSuccessMessage(
          `${successfulUploads} file(s) uploaded successfully. Analysis is queued separately.`,
        );
      }

      if (failures.length > 0) {
        setError(failures.join(" "));
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (filter === "PDF" && item.type === "application/pdf") ||
        (filter === "IMAGE" && item.type.startsWith("image/"));

      return matchesSearch && matchesFilter;
    });
  }, [evidence, search, filter]);

  const totalSize = evidence.reduce((sum, item) => sum + item.size, 0);

  async function copyHash(hash: string) {
    try {
      await navigator.clipboard.writeText(hash);
      setSuccessMessage("SHA-256 fingerprint copied.");
    } catch {
      setError("Could not access the clipboard.");
    }
  }

  return (
    <section className="case-panel case-workspace evidence-vault">
      <div className="case-panel-heading">
        <div>
          <h2>Evidence Vault</h2>
          <p>Centralized storage for investigation evidence.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <RefreshCw size={17} className="spin" />
          ) : (
            <Upload size={17} />
          )}
          {isUploading ? "Uploading..." : "Add evidence"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      <div className="evidence-stats">
        <div className="case-overview-card">
          <Files size={19} />
          <span>Total evidence</span>
          <strong>{evidence.length}</strong>
        </div>

        <div className="case-overview-card">
          <ShieldCheck size={19} />
          <span>Fingerprints calculated</span>
          <strong>{evidence.length}</strong>
        </div>

        <div className="case-overview-card">
          <Clock3 size={19} />
          <span>Total storage</span>
          <strong>{formatBytes(totalSize)}</strong>
        </div>
      </div>

      <div className="integrity-explainer">
        <ShieldCheck size={22} />
        <div>
          <strong>SHA-256 integrity fingerprints</strong>
          <p>
            Each uploaded file receives a SHA-256 fingerprint calculated in
            your browser. It can later be used to compare file contents and
            detect changes.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="vault-success" role="status">
          <CheckCircle2 size={17} />
          {successMessage}
          <button onClick={() => setSuccessMessage("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="evidence-error" role="alert">
          <AlertCircle size={17} />
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="vault-toolbar">
        <div className="vault-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search filename or evidence ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="vault-filters">
          {(["ALL", "PDF", "IMAGE"] as const).map((option) => (
            <button
              key={option}
              className={filter === option ? "active" : ""}
              onClick={() => setFilter(option)}
            >
              {option === "ALL" ? "All files" : option}
            </button>
          ))}
        </div>
      </div>

      {filteredEvidence.length === 0 ? (
        <div className="evidence-empty">
          <div className="evidence-empty-icon">
            <Upload size={27} />
          </div>

          <h3>
            {evidence.length === 0
              ? "Your Evidence Vault is empty"
              : "No matching evidence found"}
          </h3>

          <p>
            {evidence.length === 0
              ? "Upload screenshots, images or PDF documents to begin building your evidence collection."
              : "Try another search term or change the file-type filter."}
          </p>

          {evidence.length === 0 && (
            <button
              className="secondary-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Select files
            </button>
          )}
        </div>
      ) : (
        <div className="evidence-list">
          {filteredEvidence.map((item) => {
            const Icon = getFileIcon(item.type);

            return (
              <button
                type="button"
                className="evidence-item vault-evidence-item"
                key={item.id}
                onClick={() => setSelectedEvidence(item)}
              >
                <div className="evidence-file-icon">
                  <Icon size={21} />
                </div>

                <div className="evidence-file-info">
                  <strong>{item.name}</strong>
                  <span>
                    {formatBytes(item.size)} · {item.type}
                  </span>
                  <span className="vault-evidence-id">
                    ID: {item.id}
                  </span>
                </div>

                <div className="vault-record-status">
                  <span className={`vault-status ${item.status.toLowerCase()}`}>
                    {item.status === "COMPLETE" ? (
                      <CheckCircle2 size={15} />
                    ) : item.status === "FAILED" ? (
                      <AlertCircle size={15} />
                    ) : (
                      <Clock3 size={15} />
                    )}
                    {getStatusLabel(item.status)}
                  </span>
                  <span>{formatDate(item.addedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="evidence-disclaimer">
        This view currently displays files uploaded during this browser
        session. Persistent retrieval and live processing-status updates will
        be connected to the backend in the next step. A calculated hash alone
        does not establish authenticity or chain of custody.
      </p>

      {selectedEvidence && (
        <div
          className="vault-modal-backdrop"
          onClick={() => setSelectedEvidence(null)}
        >
          <div
            className="vault-detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vault-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vault-detail-heading">
              <div>
                <span>Evidence details</span>
                <h3 id="vault-detail-title">{selectedEvidence.name}</h3>
              </div>

              <button
                onClick={() => setSelectedEvidence(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="vault-detail-row">
              <span>Evidence ID</span>
              <code>{selectedEvidence.id}</code>
            </div>

            <div className="vault-detail-row">
              <span>File size</span>
              <strong>{formatBytes(selectedEvidence.size)}</strong>
            </div>

            <div className="vault-detail-row">
              <span>File type</span>
              <strong>{selectedEvidence.type}</strong>
            </div>

            <div className="vault-detail-row">
              <span>Uploaded</span>
              <strong>{formatDate(selectedEvidence.addedAt)}</strong>
            </div>

            <div className="vault-detail-row">
              <span>Analysis status</span>
              <strong>{getStatusLabel(selectedEvidence.status)}</strong>
            </div>

            <div className="vault-hash-detail">
              <span>SHA-256 fingerprint</span>
              <code>{selectedEvidence.hash}</code>
              <button onClick={() => copyHash(selectedEvidence.hash)}>
                <Copy size={15} />
                Copy fingerprint
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

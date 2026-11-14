import {
  BrainCircuit,
  FileSearch,
  ScanText,
  Users,
  Network,
  Clock3,
  ShieldCheck,
  LockKeyhole,
  CircleCheck,
  CircleDashed,
  ArrowRight,
} from "lucide-react";

export interface AnalysisEvidence {
  id: string;
  name: string;
  size: number;
  type: string;
  hash: string;
  addedAt: string;
}

interface AnalysisPanelProps {
  evidence: AnalysisEvidence[];
}

const pipeline = [
  {
    number: "01",
    title: "Evidence ingestion",
    description: "Register evidence files and their metadata.",
    icon: FileSearch,
  },
  {
    number: "02",
    title: "OCR and text extraction",
    description: "Extract text from images and supported documents.",
    icon: ScanText,
  },
  {
    number: "03",
    title: "Entity extraction",
    description: "Identify people, emails, phone numbers, and dates.",
    icon: Users,
  },
  {
    number: "04",
    title: "Relationship detection",
    description: "Connect entities across different evidence sources.",
    icon: Network,
  },
  {
    number: "05",
    title: "Timeline reconstruction",
    description: "Organize extracted events chronologically.",
    icon: Clock3,
  },
  {
    number: "06",
    title: "Source-linked findings",
    description: "Keep every finding traceable to its evidence source.",
    icon: ShieldCheck,
  },
];

export default function AnalysisPanel({ evidence }: AnalysisPanelProps) {
  const hasEvidence = evidence.length > 0;

  return (
    <div className="analysis-workspace">
      <div className="analysis-intro">
        <div className="analysis-intro-icon">
          <BrainCircuit size={25} />
        </div>
        <div>
          <span className="eyebrow">INTELLIGENCE ENGINE</span>
          <h2>AI Evidence Analysis</h2>
          <p>
            Transform unstructured digital evidence into traceable,
            structured intelligence.
          </p>
        </div>
      </div>

      <div className="analysis-status-card">
        <div className="analysis-status-top">
          <div>
            <span className="analysis-status-label">ENGINE STATUS</span>
            <h3>AI service not connected</h3>
          </div>
          <span className="service-status">
            <span />
            Awaiting integration
          </span>
        </div>

        <p>
          The analysis interface is ready. Connect the AI backend to enable
          OCR, entity extraction, relationship detection, and timeline
          generation.
        </p>

        <div className="analysis-security-note">
          <LockKeyhole size={17} />
          <span>
            Evidence analysis must preserve source references and access
            controls.
          </span>
        </div>
      </div>

      <div className="analysis-section-heading">
        <div>
          <h3>Analysis pipeline</h3>
          <p>Six stages planned for the intelligence workflow.</p>
        </div>
        <span className="pipeline-count">0 / 6 operational</span>
      </div>

      <div className="pipeline-list">
        {pipeline.map((stage, index) => {
          const Icon = stage.icon;

          return (
            <article className="pipeline-stage" key={stage.number}>
              <div className="pipeline-number">{stage.number}</div>

              <div className="pipeline-icon">
                <Icon size={20} />
              </div>

              <div className="pipeline-stage-info">
                <h4>{stage.title}</h4>
                <p>{stage.description}</p>
              </div>

              <span className="pipeline-pending">
                <CircleDashed size={15} />
                Pending
              </span>

              {index < pipeline.length - 1 && (
                <div className="pipeline-connector" />
              )}
            </article>
          );
        })}
      </div>

      <div className="analysis-input-card">
        <div className="analysis-input-heading">
          <div>
            <h3>Evidence input</h3>
            <p>Files currently registered in this case workspace.</p>
          </div>
          <span className="evidence-count-label">{evidence.length} files</span>
        </div>

        {!hasEvidence ? (
          <div className="analysis-no-evidence">
            <FileSearch size={23} />
            <p>No evidence files registered yet.</p>
            <span>Add files in the Evidence tab to prepare this workspace.</span>
          </div>
        ) : (
          <div className="analysis-evidence-list">
            {evidence.map((file) => (
              <div className="analysis-evidence-row" key={file.id}>
                <div className="analysis-file-icon">
                  <FileSearch size={17} />
                </div>
                <div>
                  <strong>{file.name}</strong>
                  <span>{file.type}</span>
                </div>
                <CircleCheck size={17} className="analysis-ready-icon" />
              </div>
            ))}
          </div>
        )}

        <div className="analysis-action-area">
          <button className="analysis-run-button" disabled>
            Prepare analysis
            <ArrowRight size={17} />
          </button>
          <span>Available after connecting the AI processing service.</span>
        </div>
      </div>

      <div className="analysis-footnote">
        <ShieldCheck size={16} />
        <p>
          No AI-generated findings are displayed until a processing service
          produces verifiable results linked to the original evidence.
        </p>
      </div>
    </div>
  );
}

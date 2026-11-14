
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  FolderSearch,
  CalendarDays,
  Files,
  MoreHorizontal,
  X,
  ArrowUpRight,
} from "lucide-react";
import InvestigationDetail from "./InvestigationDetail";

export type Status = "Active" | "In Review" | "Completed";

export interface Investigation {
  id: string;
  title: string;
  category: string;
  status: Status;
  evidenceCount: number;
  createdAt: string;
}

const initialInvestigations: Investigation[] = [
  {
    id: "CM-024",
    title: "Social Platform Harassment",
    category: "Online Harassment",
    status: "Completed",
    evidenceCount: 8,
    createdAt: "Nov 14, 2026",
  },
  {
    id: "CM-023",
    title: "Payment Impersonation",
    category: "Fraud",
    status: "In Review",
    evidenceCount: 5,
    createdAt: "Nov 13, 2026",
  },
  {
    id: "CM-021",
    title: "Repeated Contact Pattern",
    category: "Stalking",
    status: "Active",
    evidenceCount: 3,
    createdAt: "Nov 11, 2026",
  },
];

const filters = ["All", "Active", "In Review", "Completed"] as const;
type Filter = (typeof filters)[number];

export default function Investigations() {
  const [investigations, setInvestigations] =
    useState<Investigation[]>(initialInvestigations);
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<Investigation | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const filteredInvestigations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return investigations.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [investigations, search, filter]);

  function createInvestigation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !category.trim()) return;

    const nextNumber =
      Math.max(
        24,
        ...investigations.map((item) => Number(item.id.split("-")[1])),
      ) + 1;

    const newInvestigation: Investigation = {
      id: `CM-${String(nextNumber).padStart(3, "0")}`,
      title: title.trim(),
      category: category.trim(),
      status: "Active",
      evidenceCount: 0,
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    setInvestigations((current) => [newInvestigation, ...current]);
    setTitle("");
    setCategory("");
    setModalOpen(false);
    setFilter("All");
    setSearch("");
  }

  function statusClass(status: Status) {
    return status.toLowerCase().replace(" ", "-");
  }

  if (selectedInvestigation) {
    return (
      <InvestigationDetail
        investigation={selectedInvestigation}
        onBack={() => setSelectedInvestigation(null)}
      />
    );
  }

  return (
    <section className="investigations-page">
      <div className="investigations-heading">
        <div>
          <span className="eyebrow">CASE MANAGEMENT</span>
          <h1>Investigations</h1>
          <p>
            Manage cases, organize evidence, and follow investigation progress.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} />
          New Investigation
        </button>
      </div>

      <div className="investigation-summary">
        <div className="investigation-summary-card">
          <span>Total investigations</span>
          <strong>{investigations.length}</strong>
        </div>
        <div className="investigation-summary-card">
          <span>Active</span>
          <strong>
            {investigations.filter((item) => item.status === "Active").length}
          </strong>
        </div>
        <div className="investigation-summary-card">
          <span>In review</span>
          <strong>
            {investigations.filter((item) => item.status === "In Review").length}
          </strong>
        </div>
        <div className="investigation-summary-card">
          <span>Evidence files</span>
          <strong>
            {investigations.reduce(
              (total, item) => total + item.evidenceCount,
              0,
            )}
          </strong>
        </div>
      </div>

      <div className="investigation-toolbar">
        <div className="investigation-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by case name, ID, or category..."
          />
        </div>

        <div className="investigation-filters">
          {filters.map((item) => (
            <button
              key={item}
              className={`filter-button ${filter === item ? "selected" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="investigation-list-header">
        <div>
          <h2>All investigations</h2>
          <p>
            Showing {filteredInvestigations.length} of {investigations.length} cases
          </p>
        </div>
        <button className="icon-button" aria-label="More options">
          <MoreHorizontal size={21} />
        </button>
      </div>

      <div className="investigation-list">
        {filteredInvestigations.length > 0 ? (
          filteredInvestigations.map((item) => (
            <article className="investigation-card" key={item.id}>
              <div className="investigation-folder-icon">
                <FolderSearch size={23} />
              </div>

              <div className="investigation-main">
                <div className="investigation-title-row">
                  <h3>{item.title}</h3>
                  <span className={`status-pill ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="investigation-meta">
                  <span>{item.id}</span>
                  <span className="meta-dot">•</span>
                  <span>{item.category}</span>
                </div>

                <div className="investigation-details">
                  <span>
                    <Files size={15} />
                    {item.evidenceCount} evidence files
                  </span>
                  <span>
                    <CalendarDays size={15} />
                    Created {item.createdAt}
                  </span>
                </div>
              </div>

              <button
                className="case-open-button"
                title={`Open ${item.title}`}
                aria-label={`Open ${item.title}`}
                onClick={() => setSelectedInvestigation(item)}
              >
                <ArrowUpRight size={19} />
              </button>
            </article>
          ))
        ) : (
          <div className="investigation-empty">
            <FolderSearch size={35} />
            <h3>No investigations found</h3>
            <p>Try another search term or change the status filter.</p>
            <button
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="demo-disclaimer">
        Demo workspace · Investigation records shown here are illustrative.
      </p>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <div className="investigation-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">CASE MANAGEMENT</span>
                <h2>Create investigation</h2>
                <p>Start a new case workspace.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createInvestigation}>
              <label htmlFor="case-title">Investigation name</label>
              <input
                id="case-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Online impersonation"
                required
              />

              <label htmlFor="case-category">Category</label>
              <input
                id="case-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Cybercrime, Fraud, Harassment"
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={17} />
                  Create case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

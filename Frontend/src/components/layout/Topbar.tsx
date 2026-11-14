
import {
  ArrowLeft,
  Menu,
  Search,
  Bell,
  ChevronRight,
  Home,
} from "lucide-react";

interface TopbarProps {
  pageTitle: string;
  onMenuClick: () => void;
  onBackClick: () => void;
  onHomeClick: () => void;
}

export default function Topbar({
  pageTitle,
  onMenuClick,
  onBackClick,
  onHomeClick,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="back-button"
          onClick={onBackClick}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={17} />
          <span>Back</span>
        </button>

        <button
          className="home-button"
          onClick={onHomeClick}
          aria-label="Go to home page"
          title="Home"
        >
          <Home size={17} />
          <span>Home</span>
        </button>

        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={15} />
          <strong>{pageTitle}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-container">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search investigations, evidence..."
            aria-label="Search workspace"
          />

          <kbd>⌘ K</kbd>
        </div>

        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="profile">
          <div className="profile-avatar">P</div>

          <div className="profile-info">
            <strong>Workspace User</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

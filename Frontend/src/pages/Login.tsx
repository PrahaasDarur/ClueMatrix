import {
  BriefcaseBusiness,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export type UserRole = "Victim" | "Lawyer" | "Judge" | "Admin";

const roles: Array<{
  name: UserRole;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    name: "Victim",
    description: "Organize and review evidence related to your case.",
    icon: UserRound,
  },
  {
    name: "Lawyer",
    description: "Manage case materials and prepare for legal review.",
    icon: BriefcaseBusiness,
  },
  {
    name: "Judge",
    description: "Review case evidence and investigation summaries.",
    icon: Scale,
  },
  {
    name: "Admin",
    description: "Oversee workspace activity and investigation access.",
    icon: ShieldCheck,
  },
];

interface LoginProps {
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function Login({
  selectedRole,
  onRoleSelect,
  onContinue,
  onBack,
}: LoginProps) {
  const [step, setStep] = useState<"role" | "credentials">("role");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="landing-page login-page page-slide-in">
      <div className="landing-background" aria-hidden="true">
        <div className="landing-grid" />
        <div className="landing-orb landing-orb-blue" />
        <div className="landing-orb landing-orb-teal" />
        <div className="landing-orb landing-orb-violet" />
      </div>

      <section className="login-panel login-step" key={step}>
        <button className="login-back" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Back to home
        </button>
        {step === "credentials" && (
          <button
            className="login-back login-change-role"
            type="button"
            onClick={() => setStep("role")}
          >
            <span aria-hidden="true">←</span>
            Change role
          </button>
        )}

        <p className="login-brand">Clue<span>Matrix</span></p>
        <p className="eyebrow">WORKSPACE ACCESS</p>
        {step === "role" ? (
          <>
            <h1>How will you use ClueMatrix?</h1>
            <p className="login-description">
              Select your role to continue to the evidence intelligence workspace.
            </p>

            <div className="role-options" aria-label="Select your role">
              {roles.map(({ name, description, icon: Icon }) => (
                <button
                  className={`role-option${selectedRole === name ? " selected" : ""}`}
                  key={name}
                  type="button"
                  aria-pressed={selectedRole === name}
                  onClick={() => onRoleSelect(name)}
                >
                  <span className="role-icon"><Icon size={21} /></span>
                  <span className="role-copy">
                    <strong>{name}</strong>
                    <span>{description}</span>
                  </span>
                  <span className="role-selection-indicator" aria-hidden="true" />
                </button>
              ))}
            </div>

            <button
              className="login-continue"
              type="button"
              disabled={!selectedRole}
              onClick={() => setStep("credentials")}
            >
              {selectedRole ? `Continue as ${selectedRole}` : "Select a role to continue"}
              <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <>
            <h1>Sign in as {selectedRole}</h1>
            <p className="login-description">
              Enter your ID and password to continue to your workspace.
            </p>
            <form
              className="login-credentials"
              onSubmit={(event) => {
                event.preventDefault();
                if (selectedRole && userId.trim() && password) {
                  onContinue();
                }
              }}
            >
              <label>
                ID
                <input
                  type="text"
                  name="userId"
                  autoComplete="username"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button
                className="login-continue"
                type="submit"
                disabled={!userId.trim() || !password}
              >
                Continue as {selectedRole}
                <span aria-hidden="true">→</span>
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

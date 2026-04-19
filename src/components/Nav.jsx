const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "portfolio", label: "Portfolio" },
  { id: "add", label: "Add Trade" },
  { id: "brief", label: "Daily Brief" },
  { id: "signals", label: "Signals" },
  { id: "recommendations", label: "Recommendations" },
  { id: "kb", label: "Knowledge Base" },
];

export default function Nav({ tab, setTab, positionCount }) {
  return (
    <nav className="flex items-center gap-1 px-4 py-3 border-b border-slate-800 bg-slate-900 flex-wrap">
      <Logo onClick={() => setTab("dashboard")} />
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            tab === t.id
              ? "bg-amber-500 text-black"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {t.label}
          {t.id === "portfolio" && positionCount > 0 && (
            <span className="ml-1.5 text-xs opacity-70">({positionCount})</span>
          )}
        </button>
      ))}
    </nav>
  );
}

function Logo({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 mr-4 group flex-shrink-0"
      title="Investment Intelligence — Home"
    >
      <div className="w-8 h-8 rounded-lg bg-amber-500 group-hover:bg-amber-400 transition-colors flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <polyline
            points="2,13 6,7 10,10 16,2"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="2" y1="15.5" x2="16" y2="15.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-tight text-left hidden sm:block">
        <div className="text-xs text-slate-500 font-medium tracking-widest uppercase leading-none">
          Investment
        </div>
        <div className="text-sm text-white font-bold tracking-tight leading-tight">
          Intelligence
        </div>
      </div>
    </button>
  );
}

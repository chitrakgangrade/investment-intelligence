import { useState } from "react";
import { VIMAL_HISTORY } from "../Engine/vimalData";

function parseWADateLocal(str) {
  if (!str) return null;
  const p = str.split("/");
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}

function getWeightedScore(rec) {
  const lastDate = parseWADateLocal(rec.lastDate);
  if (!lastDate) return rec.count * 0.5;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const mult = lastDate > oneMonthAgo ? 3.0 : lastDate > sixMonthsAgo ? 2.0 : 0.5;
  return Number((rec.count * mult).toFixed(1));
}

function getStatus(rec, portfolioSet) {
  const nameKey = rec.ticker.replace(".NS", "").toUpperCase();
  const inPortfolio =
    portfolioSet.has(nameKey) ||
    portfolioSet.has((rec.displayName || "").toUpperCase().replace(/\s+/g, ""));
  if (inPortfolio) return "portfolio";
  const hist = VIMAL_HISTORY[rec.ticker];
  if (hist && hist.pnl > 50) return "missed";
  if (rec.count >= 3 && (!hist || hist.pnl >= 0)) return "consider";
  if (hist && hist.pnl < 0) return "steer";
  return "watch";
}

const STATUS_META = {
  portfolio: { label: "In Portfolio", bg: "bg-amber-900/50 border-amber-700", text: "text-amber-300" },
  consider:  { label: "Consider",     bg: "bg-green-900/50 border-green-700",  text: "text-green-300" },
  missed:    { label: "Missed",        bg: "bg-red-900/50 border-red-700",      text: "text-red-300" },
  steer:     { label: "Steer Clear",   bg: "bg-slate-800 border-slate-600",     text: "text-slate-400" },
  watch:     { label: "Watch",         bg: "bg-blue-900/50 border-blue-700",    text: "text-blue-300" },
};

const SORT_OPTIONS = [
  { value: "weighted", label: "Weighted Score ↓ (recent ×3)" },
  { value: "mentions", label: "Total Mentions ↓" },
  { value: "date",     label: "Last Seen ↓" },
  { value: "histPnl",  label: "Historical P&L ↓" },
  { value: "name",     label: "Name A→Z" },
];

const FILTERS = [
  { value: "all",       label: "All" },
  { value: "consider",  label: "Consider" },
  { value: "portfolio", label: "In Portfolio" },
  { value: "missed",    label: "Missed" },
  { value: "watch",     label: "Watch" },
  { value: "steer",     label: "Steer Clear" },
];

function parseWADateToTs(str) {
  const d = parseWADateLocal(str);
  return d ? d.getTime() : 0;
}

export default function Recommendations({ recommendations, positions }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("weighted");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const portfolioSet = new Set(positions.map((p) => p.name.toUpperCase()));

  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <div className="p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-white mb-2">Recommendations</h2>
        <p className="text-slate-500 text-sm">
          No signals saved yet. Upload a WhatsApp chat in the{" "}
          <strong className="text-slate-400">Signals</strong> tab and hit{" "}
          <strong className="text-slate-400">Save Signals</strong>.
        </p>
      </div>
    );
  }

  let items = Object.values(recommendations).map((rec) => ({
    ...rec,
    hist: VIMAL_HISTORY[rec.ticker] || null,
    status: getStatus(rec, portfolioSet),
    weightedScore: getWeightedScore(rec),
  }));

  const q = search.toLowerCase().trim();
  if (q) items = items.filter((r) => r.displayName?.toLowerCase().includes(q) || r.ticker.toLowerCase().includes(q));
  if (filter !== "all") items = items.filter((r) => r.status === filter);

  items = [...items].sort((a, b) => {
    if (sort === "weighted") return b.weightedScore - a.weightedScore;
    if (sort === "mentions") return b.count - a.count;
    if (sort === "date")     return parseWADateToTs(b.lastDate) - parseWADateToTs(a.lastDate);
    if (sort === "histPnl")  return (b.hist?.pnl ?? -999) - (a.hist?.pnl ?? -999);
    if (sort === "name")     return (a.displayName || "").localeCompare(b.displayName || "");
    return 0;
  });

  const counts = {};
  FILTERS.forEach((f) => {
    counts[f.value] = f.value === "all"
      ? Object.keys(recommendations).length
      : Object.values(recommendations).filter((r) => getStatus(r, portfolioSet) === f.value).length;
  });

  // Recency label helper
  function recencyLabel(lastDate) {
    const d = parseWADateLocal(lastDate);
    if (!d) return null;
    const now = new Date();
    const days = Math.floor((now - d) / 86400000);
    if (days <= 7) return { label: "This week", color: "text-green-400" };
    if (days <= 30) return { label: "This month", color: "text-green-400" };
    if (days <= 180) return { label: "< 6 months", color: "text-amber-400" };
    return { label: "> 6 months", color: "text-slate-500" };
  }

  return (
    <div className="p-6 max-w-4xl space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Recommendations</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          {Object.keys(recommendations).length} stocks tracked · Recent mentions weighted ×3 / ×2
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text" placeholder="Search stock…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 placeholder-slate-600 w-44"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${filter === f.value ? "bg-amber-500 border-amber-500 text-black font-medium" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"}`}>
            {f.label} <span className="ml-1 opacity-60">({counts[f.value] ?? 0})</span>
          </button>
        ))}
      </div>

      {items.length === 0 && <p className="text-slate-500 text-sm italic">No results.</p>}

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((r) => {
            const meta = STATUS_META[r.status];
            const isExpanded = expanded === r.ticker;
            const rec = recencyLabel(r.lastDate);

            return (
              <div key={r.ticker} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : r.ticker)}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Name + badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white capitalize">{r.displayName}</span>
                      <span className="text-xs text-slate-500 font-mono">{r.ticker.replace(".NS", "")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${meta.bg} ${meta.text}`}>{meta.label}</span>
                      {r.hist && (
                        <span className={`text-xs px-2 py-0.5 rounded border ${r.hist.pnl >= 50 ? "bg-green-950 border-green-800 text-green-400" : r.hist.pnl >= 0 ? "bg-emerald-950 border-emerald-800 text-emerald-400" : "bg-red-950 border-red-800 text-red-400"}`}>
                          Hist {r.hist.pnl >= 0 ? "+" : ""}{r.hist.pnl}%
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs flex-wrap">
                      <div className="text-right">
                        <span className="text-white font-bold">{r.count}</span>
                        <span className="text-slate-500"> mentions</span>
                        {sort === "weighted" && (
                          <span className="text-amber-500 ml-1">(score {r.weightedScore})</span>
                        )}
                      </div>
                      {rec && <span className={rec.color}>{rec.label}</span>}
                      <span className="text-slate-600">{r.lastDate}</span>
                      {r.hist?.target && <span className="text-amber-500">₹{r.hist.target}</span>}
                      <span className="text-slate-600">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800 px-3 pb-3 pt-2 space-y-1.5">
                    <div className="flex gap-4 text-xs text-slate-500 mb-2 flex-wrap">
                      <span>First seen: {r.firstDate}</span>
                      {r.hist && <>
                        <span>Historical P&L: <span className={r.hist.pnl >= 0 ? "text-green-400" : "text-red-400"}>{r.hist.pnl >= 0 ? "+" : ""}{r.hist.pnl}%</span></span>
                        <span>Past re-mentions: {r.hist.reMentions}</span>
                        {r.hist.target && <span>Target: ₹{r.hist.target}</span>}
                      </>}
                      <span>Weighted score: <span className="text-amber-400">{r.weightedScore}</span> (recent ×3, &lt;6mo ×2, older ×0.5)</span>
                    </div>
                    {r.messages?.length > 0 ? r.messages.map((msg, i) => (
                      <div key={i} className="text-xs bg-slate-800 rounded px-2 py-1.5 text-slate-400">
                        <span className="text-slate-600 mr-2">{msg.date}</span>{msg.text}
                      </div>
                    )) : <p className="text-xs text-slate-600 italic">No message samples.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

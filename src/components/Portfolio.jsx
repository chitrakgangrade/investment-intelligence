import { useState } from "react";
import { applyRules } from "../Engine/rules";

function fmt(n) {
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function heldDuration(buyDate) {
  const days = Math.floor((Date.now() - new Date(buyDate)) / 86400000);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  const yr = Math.floor(days / 365);
  const mo = Math.floor((days % 365) / 30);
  return mo > 0 ? `${yr}yr ${mo}mo` : `${yr}yr`;
}

const SIGNAL_BORDER = {
  SELL_ALL: "border-l-red-500",
  PARTIAL_SELL: "border-l-orange-400",
  WARNING: "border-l-yellow-400",
  HOLD: "border-l-green-600",
};

const SIGNAL_BADGE = {
  SELL_ALL: "bg-red-900/60 text-red-300 border-red-700",
  PARTIAL_SELL: "bg-orange-900/60 text-orange-300 border-orange-700",
  WARNING: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  HOLD: "bg-green-900/40 text-green-400 border-green-700",
};

const SORT_OPTIONS = [
  { value: "signal", label: "By Signal" },
  { value: "pnl_desc", label: "P&L % ↓" },
  { value: "pnl_asc", label: "P&L % ↑" },
  { value: "name", label: "Name" },
  { value: "held", label: "Longest Held" },
];

const SIGNAL_ORDER = { SELL_ALL: 0, PARTIAL_SELL: 1, WARNING: 2, HOLD: 3 };

export default function Portfolio({ positions, onUpdatePrice, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [sort, setSort] = useState("signal");

  function startEdit(pos) {
    setEditingId(pos.id);
    setPriceInput(String(pos.currentPrice));
  }

  function commitEdit(id) {
    if (priceInput && !isNaN(priceInput) && Number(priceInput) > 0) {
      onUpdatePrice(id, priceInput);
    }
    setEditingId(null);
  }

  if (!positions.length) {
    return (
      <div className="p-6">
        <p className="text-slate-500 text-sm">No positions yet. Add a trade to get started.</p>
      </div>
    );
  }

  // Enrich with rules
  const enriched = positions.map((p) => {
    const rules = applyRules(p);
    const top = rules[0] || null;
    const gainPct = Number((((p.currentPrice - p.buyPrice) / p.buyPrice) * 100).toFixed(1));
    const gainAbs = (p.currentPrice - p.buyPrice) * p.units;
    return { p, rules, top, gainPct, gainAbs };
  });

  // Sort
  const sorted = [...enriched].sort((a, b) => {
    if (sort === "signal") {
      const oa = SIGNAL_ORDER[a.top?.type ?? "HOLD"];
      const ob = SIGNAL_ORDER[b.top?.type ?? "HOLD"];
      return oa !== ob ? oa - ob : b.gainPct - a.gainPct;
    }
    if (sort === "pnl_desc") return b.gainPct - a.gainPct;
    if (sort === "pnl_asc") return a.gainPct - b.gainPct;
    if (sort === "name") return a.p.name.localeCompare(b.p.name);
    if (sort === "held") return new Date(a.p.buyDate) - new Date(b.p.buyDate);
    return 0;
  });

  // Summary stats
  const totalInvested = positions.reduce((s, p) => s + p.buyPrice * p.units, 0);
  const totalCurrent = positions.reduce((s, p) => s + p.currentPrice * p.units, 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested ? ((totalPnl / totalInvested) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 max-w-3xl space-y-4">
      {/* Header + sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            Portfolio <span className="text-slate-500 font-normal text-base">({positions.length})</span>
          </h2>
          <p className={`text-sm mt-0.5 ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}₹{fmt(totalPnl)} ({totalPnl >= 0 ? "+" : ""}{totalPnlPct}%) total P&L
          </p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1.5 focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {sorted.map(({ p, rules, top, gainPct, gainAbs }) => {
        const signalType = top?.type ?? "HOLD";
        const border = SIGNAL_BORDER[signalType];
        const badge = SIGNAL_BADGE[signalType];
        const isEditing = editingId === p.id;
        const currentValue = p.currentPrice * p.units;

        return (
          <div
            key={p.id}
            className={`bg-slate-900 border border-slate-800 border-l-4 ${border} rounded-lg p-4`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left — name + details */}
              <div className="flex-1 min-w-0">
                {/* Name row */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-bold text-white text-base">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${badge}`}>
                    {top ? top.action : "HOLD"}
                  </span>
                  {top && <span className="text-xs text-slate-500">{top.reason}</span>}
                </div>

                {/* Price row */}
                <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
                  <span className="text-slate-500">Buy</span>
                  <span>₹{fmt(p.buyPrice)}</span>
                  <span className="text-slate-600">→</span>
                  {isEditing ? (
                    <input
                      className="bg-slate-800 text-white text-sm border border-amber-500 rounded px-2 py-0.5 w-24 focus:outline-none"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(p.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => commitEdit(p.id)}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(p)}
                      className="hover:text-amber-400 transition-colors"
                      title="Click to update price"
                    >
                      ₹{fmt(p.currentPrice)}
                    </button>
                  )}
                  <span className="text-slate-600">·</span>
                  <span>{p.units} units</span>
                  <span className="text-slate-600">·</span>
                  <span>{heldDuration(p.buyDate)}</span>
                  {p.target && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-amber-600 text-xs">Target ₹{fmt(p.target)}</span>
                    </>
                  )}
                </div>

                {/* Secondary signals */}
                {rules.length > 1 && (
                  <div className="mt-1.5 flex gap-1.5 flex-wrap">
                    {rules.slice(1).map((r, i) => (
                      <span key={i} className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                        {r.reason}: {r.action}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — P&L + delete */}
              <div className="flex items-start gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className={`text-2xl font-bold tabular-nums ${gainPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {gainPct >= 0 ? "+" : ""}{gainPct}%
                  </div>
                  <div className={`text-sm font-medium ${gainPct >= 0 ? "text-green-500/70" : "text-red-500/70"}`}>
                    {gainAbs >= 0 ? "+" : "−"}₹{fmt(Math.abs(gainAbs))}
                  </div>
                  <div className="text-slate-600 text-xs mt-0.5">₹{fmt(currentValue)}</div>
                </div>
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-slate-700 hover:text-red-400 transition-colors text-xl leading-none px-1 mt-1"
                  title="Remove position"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

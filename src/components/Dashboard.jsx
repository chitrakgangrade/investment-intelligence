import { applyRules } from "../Engine/rules";

function fmt(n) {
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function Dashboard({ positions }) {
  const invested = positions.reduce((s, p) => s + p.buyPrice * p.units, 0);
  const current = positions.reduce((s, p) => s + p.currentPrice * p.units, 0);
  const pnl = current - invested;
  const pnlPct = invested ? ((pnl / invested) * 100).toFixed(1) : "0.0";

  let sellAll = 0,
    partial = 0,
    warning = 0,
    hold = 0;
  for (const p of positions) {
    const rules = applyRules(p);
    if (!rules.length) {
      hold++;
      continue;
    }
    const t = rules[0].type;
    if (t === "SELL_ALL") sellAll++;
    else if (t === "PARTIAL_SELL") partial++;
    else warning++;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-xl font-bold text-white">Investment Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total Invested" value={`₹${fmt(invested)}`} />
        <MetricCard label="Current Value" value={`₹${fmt(current)}`} />
        <MetricCard
          label="P&L"
          value={`₹${fmt(Math.abs(pnl))}`}
          sub={`${pnl >= 0 ? "+" : "-"}${Math.abs(pnlPct)}%`}
          color={pnl >= 0 ? "text-green-400" : "text-red-400"}
          prefix={pnl >= 0 ? "+" : "-"}
        />
        <MetricCard label="Positions" value={positions.length} />
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Today's Signals
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SignalCard
            label="Sell All"
            count={sellAll}
            bg="bg-red-950"
            border="border-red-800"
            text="text-red-400"
          />
          <SignalCard
            label="Partial Sell"
            count={partial}
            bg="bg-orange-950"
            border="border-orange-800"
            text="text-orange-400"
          />
          <SignalCard
            label="Warning"
            count={warning}
            bg="bg-yellow-950"
            border="border-yellow-800"
            text="text-yellow-400"
          />
          <SignalCard
            label="Hold"
            count={hold}
            bg="bg-green-950"
            border="border-green-800"
            text="text-green-400"
          />
        </div>
      </div>

      {positions.length === 0 && (
        <p className="text-slate-500 text-sm">
          No positions yet. Add a trade to get started.
        </p>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color, prefix }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-xl font-bold ${color || "text-white"}`}>
        {prefix}
        {value}
      </div>
      {sub && (
        <div className={`text-sm mt-0.5 ${color || "text-slate-400"}`}>{sub}</div>
      )}
    </div>
  );
}

function SignalCard({ label, count, bg, border, text }) {
  return (
    <div className={`${bg} border ${border} rounded-lg p-4`}>
      <div className={`text-3xl font-bold ${text}`}>{count}</div>
      <div
        className={`text-xs uppercase tracking-wider mt-1 ${text} opacity-80`}
      >
        {label}
      </div>
    </div>
  );
}

import { categorize } from "../Engine/rules";

function fmt(n) {
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function DailyBrief({ positions }) {
  const { sellAll, partialSell, warnings, holds } = categorize(positions);
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!positions.length) {
    return (
      <div className="p-6">
        <p className="text-slate-500 text-sm">
          No positions yet. Add trades to generate your daily brief.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-white">Daily Brief</h2>
        <p className="text-slate-500 text-xs mt-1">{date}</p>
      </div>

      <BriefSection
        title="🔴 Sell All"
        items={sellAll}
        emptyMsg="No forced sells today."
        sectionColor="border-red-800 bg-red-950/20"
        badgeStyle="bg-red-900 text-red-300"
        gainColor="text-red-400"
      />

      <BriefSection
        title="🟡 Partial Sell"
        items={partialSell}
        emptyMsg="No partial sells today."
        sectionColor="border-orange-800 bg-orange-950/20"
        badgeStyle="bg-orange-900 text-orange-300"
        gainColor="text-orange-400"
      />

      <BriefSection
        title="⚠️ Watch"
        items={warnings}
        emptyMsg="No warnings today."
        sectionColor="border-yellow-800 bg-yellow-950/20"
        badgeStyle="bg-yellow-900 text-yellow-300"
        gainColor="text-yellow-400"
      />

      <div>
        <h3 className="text-sm font-semibold text-green-400 mb-2">
          🟢 Hold ({holds.length})
        </h3>
        {holds.length === 0 ? (
          <p className="text-slate-600 text-xs italic">Nothing to hold.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {holds.map(({ position: p }) => (
              <span
                key={p.id}
                className="text-xs bg-green-950 border border-green-800 text-green-300 px-2.5 py-1 rounded"
              >
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BriefSection({ title, items, emptyMsg, sectionColor, badgeStyle }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2">
        {title} ({items.length})
      </h3>
      {items.length === 0 ? (
        <p className="text-slate-600 text-xs italic">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {items.map(({ position: p, signal, rules }) => {
            const gainPct = (
              ((p.currentPrice - p.buyPrice) / p.buyPrice) *
              100
            ).toFixed(1);
            const value = p.currentPrice * p.units;
            return (
              <div
                key={p.id}
                className={`border rounded-lg p-3 ${sectionColor}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${badgeStyle}`}>
                      {signal.action}
                    </span>
                    <span className="text-xs text-slate-400">{signal.reason}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium ${Number(gainPct) >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {gainPct >= 0 ? "+" : ""}
                      {gainPct}%
                    </span>
                    <span className="text-slate-500 text-xs ml-2">
                      ₹{fmt(value)}
                    </span>
                  </div>
                </div>
                {rules.length > 1 && (
                  <div className="mt-1.5 text-xs text-slate-500">
                    Also:{" "}
                    {rules
                      .slice(1)
                      .map((r) => `${r.reason} → ${r.action}`)
                      .join(" · ")}
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

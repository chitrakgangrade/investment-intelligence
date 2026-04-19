import { useState, useRef } from "react";
import { parseWhatsApp, getLastMessageDate, extractGroupName } from "../Engine/parseWhatsApp";
import { VIMAL_HISTORY } from "../Engine/vimalData";

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

export default function WhatsAppIntel({
  positions, chatGroups, signalLogs, onSaveSignals, onResetSignals,
}) {
  const [signals, setSignals] = useState(null);
  const [lastMsgDate, setLastMsgDate] = useState(null);
  const [detectedGroup, setDetectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [expandedTicker, setExpandedTicker] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const fileRef = useRef();

  const portfolioNames = positions.map((p) => p.name);
  const portfolioSet = new Set(positions.map((p) => p.name.toUpperCase()));

  function handleFile(file) {
    if (!file) return;
    setLoading(true);
    setError("");
    setSaved(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const group = extractGroupName(text);
        const lastDate = getLastMessageDate(text);
        const cutoff = chatGroups[group] || null; // per-group delta

        setDetectedGroup(group);
        setLastMsgDate(lastDate);

        const result = parseWhatsApp(text, portfolioNames, cutoff);
        if (result.length === 0) {
          setError(
            cutoff
              ? `No new Vimal Parwal messages found in "${group}" after ${cutoff}. Upload a newer export, or reset this group's log.`
              : `No Vimal Parwal messages found. Make sure this is an iOS WhatsApp export (.txt).`
          );
        } else {
          setSignals(result);
        }
      } catch {
        setError("Could not parse file. Upload a WhatsApp text export (.txt).");
      }
      setLoading(false);
    };
    reader.readAsText(file, "utf-8");
  }

  function onDrop(e) { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }

  function handleSave() {
    onSaveSignals(signals, lastMsgDate, detectedGroup);
    setSaved(true);
    setSignals(null);
  }

  const groupCutoff = detectedGroup ? chatGroups[detectedGroup] : null;

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Vimal Parwal Signals</h2>
          <p className="text-slate-500 text-xs mt-0.5">76% XIRR · 80% win rate · 109 picks analysed</p>
        </div>
        <div className="flex gap-2">
          {signalLogs.length > 0 && (
            <button onClick={() => setShowLog((v) => !v)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors">
              {showLog ? "Hide" : "Show"} Log ({signalLogs.length})
            </button>
          )}
        </div>
      </div>

      {/* Per-group delta indicator — shown after detecting the group */}
      {detectedGroup && groupCutoff && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-4 py-2.5 text-sm flex items-center justify-between gap-3">
          <span>
            <span className="text-amber-400 font-medium">Delta:</span>
            <span className="text-amber-200/70 ml-2">
              Group <strong>"{detectedGroup}"</strong> — importing messages after <strong>{groupCutoff}</strong>
            </span>
          </span>
          <button onClick={() => onResetSignals(detectedGroup)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
            Reset group
          </button>
        </div>
      )}

      {/* Known groups summary */}
      {Object.keys(chatGroups).length > 0 && !detectedGroup && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-xs text-slate-500">
          <span className="text-slate-400 font-medium">Tracked groups: </span>
          {Object.entries(chatGroups).map(([grp, date]) => (
            <span key={grp} className="mr-3">
              <span className="text-white">{grp}</span>
              <span className="ml-1 text-slate-600">up to {date}</span>
              <button onClick={() => onResetSignals(grp)} className="ml-1 text-red-500/60 hover:text-red-400">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {!signals && !saved && (
        <div
          className="border-2 border-dashed border-slate-700 rounded-xl p-10 text-center cursor-pointer hover:border-amber-500 transition-colors"
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="text-3xl mb-3">💬</div>
          <p className="text-white font-medium mb-1">Upload WhatsApp Chat Export</p>
          <p className="text-slate-500 text-sm">iOS: Settings → Chat → Export Chat → Without Media</p>
          <p className="text-slate-600 text-xs mt-2">
            Group-aware delta tracking · Parsed locally · .txt only
          </p>
          <input ref={fileRef} type="file" accept=".txt" className="hidden"
            onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      )}

      {loading && <p className="text-amber-400 text-sm">Parsing chat…</p>}
      {error && <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded px-3 py-2">{error}</p>}

      {saved && (
        <div className="bg-green-950 border border-green-800 rounded-lg px-4 py-3 text-green-300 text-sm">
          ✓ Signals saved for <strong>"{detectedGroup}"</strong>. Go to{" "}
          <strong>Recommendations</strong> to review all picks.
          <button onClick={() => { setSaved(false); setDetectedGroup(null); }}
            className="ml-3 text-xs text-slate-500 hover:text-white">Upload another</button>
        </div>
      )}

      {/* Pending signals — confirm before saving */}
      {signals && (
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="text-slate-300 text-sm">
              <span className="text-white font-bold">{signals.length}</span> stocks found in{" "}
              <span className="text-amber-400">"{detectedGroup}"</span>
              {groupCutoff && <span className="text-slate-500"> after {groupCutoff}</span>}
              {lastMsgDate && <span className="text-slate-500"> · last message {lastMsgDate}</span>}
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setSignals(null); setDetectedGroup(null); }}
                className="text-xs px-3 py-1.5 bg-slate-800 text-slate-400 rounded">Cancel</button>
              <button onClick={handleSave}
                className="text-sm px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded transition-colors">
                Save {signals.length} Signals →
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {signals.map((s) => {
              const hist = VIMAL_HISTORY[s.ticker];
              const inPortfolio = portfolioSet.has(s.ticker.replace(".NS", "")) ||
                positions.some((p) => p.name.toLowerCase() === s.displayName?.toLowerCase());
              const isExpanded = expandedTicker === s.ticker;

              return (
                <div key={s.ticker} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="p-3 cursor-pointer hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-2 flex-wrap"
                    onClick={() => setExpandedTicker(isExpanded ? null : s.ticker)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white capitalize">{s.displayName}</span>
                      <span className="text-xs text-slate-500 font-mono">{s.ticker.replace(".NS", "")}</span>
                      {inPortfolio && <span className="text-xs px-2 py-0.5 rounded border bg-amber-900 border-amber-700 text-amber-300">In Portfolio</span>}
                      {hist && (
                        <span className={`text-xs px-2 py-0.5 rounded border ${hist.pnl >= 50 ? "bg-green-950 border-green-800 text-green-400" : hist.pnl >= 0 ? "bg-emerald-950 border-emerald-800 text-emerald-400" : "bg-red-950 border-red-800 text-red-400"}`}>
                          Hist {hist.pnl >= 0 ? "+" : ""}{hist.pnl}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span><span className="text-white font-medium">{s.count}</span>×</span>
                      <span>Last {s.lastDate}</span>
                      {hist?.target && <span className="text-amber-500">₹{hist.target}</span>}
                      <span className="text-slate-600">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {isExpanded && s.messages?.length > 0 && (
                    <div className="border-t border-slate-800 px-3 pb-3 pt-2 space-y-1.5">
                      {s.messages.map((msg, i) => (
                        <div key={i} className="text-xs bg-slate-800 rounded px-2 py-1.5 text-slate-400">
                          <span className="text-slate-600 mr-2">{msg.date}</span>{msg.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload log */}
      {showLog && signalLogs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Upload History</h3>
          <div className="space-y-2">
            {signalLogs.map((log) => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-white font-medium">{fmtDate(log.savedAt)}</span>
                    {log.groupName && <span className="text-xs text-slate-500">"{log.groupName}"</span>}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>{log.stockCount} stocks · {log.totalMentions} mentions</span>
                    {log.newStocks > 0 && <span className="text-green-400">+{log.newStocks} new</span>}
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {log.processedAfter ? `Delta after ${log.processedAfter}` : "Full scan"} · last msg {log.lastMessageDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

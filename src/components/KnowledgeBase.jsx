import { useState } from "react";

const CONVICTION_LABELS = ["—", "Low", "Medium", "High", "Very High", "Conviction Buy"];

export default function KnowledgeBase({ positions, notes, onSaveNote }) {
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [conviction, setConviction] = useState(0);

  function open(name) {
    const existing = notes[name] || {};
    setSelected(name);
    setNoteText(existing.text || "");
    setConviction(existing.conviction || 0);
  }

  function save() {
    onSaveNote(selected, {
      text: noteText,
      conviction,
      updated: new Date().toISOString(),
    });
    setSelected(null);
  }

  if (selected) {
    const note = notes[selected] || {};
    return (
      <div className="p-6 max-w-xl">
        <button
          onClick={() => setSelected(null)}
          className="text-slate-400 text-sm mb-4 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-lg font-bold text-white mb-1">{selected}</h2>
        {note.updated && (
          <p className="text-xs text-slate-600 mb-5">
            Last updated:{" "}
            {new Date(note.updated).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}

        <div className="mb-5">
          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
            Conviction Level
          </label>
          <div className="flex gap-2 flex-wrap">
            {CONVICTION_LABELS.map((c, i) => (
              <button
                key={i}
                onClick={() => setConviction(i)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                  conviction === i
                    ? "bg-amber-500 border-amber-500 text-black font-medium"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
            Investment Thesis / Notes
          </label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 min-h-48 resize-y placeholder-slate-600 transition-colors"
            placeholder={`Why did you buy ${selected}?\nWhat's the thesis?\nAny signals? Override notes?`}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </div>

        <button
          onClick={save}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2 rounded transition-colors"
        >
          Save Notes
        </button>
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div className="p-6">
        <p className="text-slate-500 text-sm">
          No positions yet. Add trades to build your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-lg font-bold text-white mb-4">Knowledge Base</h2>
      <div className="space-y-2">
        {positions.map((p) => {
          const note = notes[p.name] || {};
          const convLabel = CONVICTION_LABELS[note.conviction || 0];
          const hasNote = !!note.text;
          return (
            <button
              key={p.id}
              onClick={() => open(p.name)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white">{p.name}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                  {note.conviction > 0 && (
                    <span className="text-amber-500">{convLabel}</span>
                  )}
                  <span className={hasNote ? "text-slate-400" : "text-slate-600"}>
                    {hasNote ? "Edit notes →" : "Add notes →"}
                  </span>
                </div>
              </div>
              {note.text && (
                <p className="text-xs text-slate-500 mt-1.5 truncate">
                  {note.text}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

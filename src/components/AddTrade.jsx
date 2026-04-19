import { useState, useRef } from "react";

const EMPTY = {
  name: "", buyDate: "", buyPrice: "", currentPrice: "",
  units: "", target: "", allTimeHigh: "",
};

// ─── Natural language position parser ────────────────────────────────────────
function parseNLPosition(raw) {
  const text = raw.replace(/₹/g, "").replace(/rs\.?/gi, "").replace(/rupees?/gi, "").trim();

  // Pattern 1: verb + qty + name + at/@ + price
  // "bought 100 ITC at 300", "added 50 hfcl @ 74"
  let m = text.match(
    /(?:bought|buy|added|purchased|got)\s+(\d+(?:\.\d+)?)\s+(?:shares?\s+(?:of\s+)?)?([a-zA-Z][a-zA-Z0-9\s]{0,30}?)\s+(?:@|at)\s*(\d+(?:\.\d+)?)/i
  );
  if (m) return { units: m[1], name: m[2].trim(), buyPrice: m[3] };

  // Pattern 2: qty + name + at/@ + price
  // "100 ITC at 300"
  m = text.match(
    /^(\d+(?:\.\d+)?)\s+(?:shares?\s+(?:of\s+)?)?([a-zA-Z][a-zA-Z0-9\s]{0,30}?)\s+(?:@|at)\s*(\d+(?:\.\d+)?)/i
  );
  if (m) return { units: m[1], name: m[2].trim(), buyPrice: m[3] };

  // Pattern 3: name + qty + at/@ + price
  // "ITC 100 at 300", "HFCL 500 @ 74"
  m = text.match(
    /^([a-zA-Z][a-zA-Z0-9\s]{0,30}?)\s+(\d+(?:\.\d+)?)\s+(?:@|at)\s*(\d+(?:\.\d+)?)/i
  );
  if (m) return { name: m[1].trim(), units: m[2], buyPrice: m[3] };

  // Pattern 4: name @ price x qty
  // "ITC @ 300 x 100"
  m = text.match(
    /([a-zA-Z][a-zA-Z0-9\s]{0,30}?)\s+@\s*(\d+(?:\.\d+)?)\s+[x×]\s*(\d+(?:\.\d+)?)/i
  );
  if (m) return { name: m[1].trim(), buyPrice: m[2], units: m[3] };

  return null;
}

function parseNLExtras(text) {
  const target = text.match(/target\s*(?:@|at|is|price)?[:\s]*(\d+(?:\.\d+)?)/i)?.[1];
  const ath = text.match(/(?:ath|high)\s*(?:@|at|is)?[:\s]*(\d+(?:\.\d+)?)/i)?.[1];
  return { target: target || "", allTimeHigh: ath || "" };
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────
function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function parseFlexDate(str) {
  if (!str || str === "#N/A") return "";
  str = str.trim();
  const dashMatch = str.match(/^(\d{1,2})-([a-zA-Z]+)-(\d{4})$/);
  if (dashMatch) {
    const [, d, m, y] = dashMatch;
    const mon = MONTH_MAP[m.toLowerCase()];
    if (mon !== undefined)
      return `${y}-${String(mon + 1).padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
}

function cleanNum(str) {
  if (!str || str === "#N/A") return NaN;
  return parseFloat(str.replace(/[₹$,%]/g, "").replace(/,/g, ""));
}

function parseTarget(str) {
  if (!str || str === "#N/A" || str.trim() === "0") return "";
  str = str.trim();
  const rangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*-\s*\d/);
  if (rangeMatch) return rangeMatch[1];
  const n = cleanNum(str);
  return !isNaN(n) && n > 0 ? String(n) : "";
}

function parseMyPortfolioCSV(text) {
  const allRows = text.split("\n").map(splitCSVLine);
  let headerIdx = -1;
  for (let i = 0; i < Math.min(allRows.length, 5); i++) {
    if (allRows[i][0].trim().toLowerCase() === "company name") {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return null;

  const rows = [];
  for (let i = headerIdx + 1; i < allRows.length; i++) {
    const cells = allRows[i];
    const rawName = (cells[0] || "").trim();
    const nameLow = rawName.toLowerCase();
    if (!rawName) continue;
    if (nameLow === "scrip name" || nameLow.startsWith("profit booking")) break;
    if (nameLow === "company name" || nameLow === "total" ||
        nameLow.startsWith("short term") || nameLow.startsWith("b.com")) continue;

    const buyPrice = cleanNum(cells[3] || "");
    const currentPrice = cleanNum(cells[4] || "");
    const units = cleanNum(cells[6] || "");
    if (isNaN(buyPrice) || buyPrice <= 0 || isNaN(units) || units <= 0) continue;

    const rawTicker = (cells[1] || "").trim();
    let symbol = rawTicker.includes(":") ? rawTicker.split(":")[1].toUpperCase() : rawTicker.toUpperCase();
    const displayName = /^\d+$/.test(symbol) ? rawName.trim() : symbol;

    rows.push({
      name: displayName,
      buyDate: parseFlexDate(cells[2] || ""),
      buyPrice: String(buyPrice),
      currentPrice: !isNaN(currentPrice) && currentPrice > 0 ? String(currentPrice) : String(buyPrice),
      units: String(units),
      target: parseTarget(cells[5] || ""),
      allTimeHigh: (() => {
        const ath = cleanNum(cells[11] || "");
        return !isNaN(ath) && ath > 0 ? String(ath) : "";
      })(),
    });
  }
  return rows.length > 0 ? rows : null;
}

const COL_ALIASES = {
  name: ["name", "stock", "ticker", "symbol", "scrip"],
  buyPrice: ["buyprice", "buy_price", "buy", "entry", "entryprice", "purchase", "cost"],
  currentPrice: ["currentprice", "current_price", "current", "ltp", "price", "cmp"],
  units: ["units", "qty", "quantity", "shares"],
  buyDate: ["buydate", "buy_date", "date", "purchasedate"],
  target: ["target", "targetprice", "target_price", "tp"],
  allTimeHigh: ["alltimehigh", "all_time_high", "ath"],
};

function parseGenericCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row.");
  const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ""));
  const map = {};
  headers.forEach((h, i) => {
    for (const [field, aliases] of Object.entries(COL_ALIASES)) {
      if (aliases.includes(h) && !(field in map)) map[field] = i;
    }
  });
  if (map.name === undefined) throw new Error("No stock name column found.");
  if (map.buyPrice === undefined) throw new Error("No buy price column found.");
  if (map.units === undefined) throw new Error("No units column found.");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const row = {
      name: cells[map.name] || "",
      buyPrice: cells[map.buyPrice] || "",
      currentPrice: map.currentPrice !== undefined ? cells[map.currentPrice] || "" : "",
      units: cells[map.units] || "",
      buyDate: map.buyDate !== undefined ? cells[map.buyDate] || "" : "",
      target: map.target !== undefined ? cells[map.target] || "" : "",
      allTimeHigh: map.allTimeHigh !== undefined ? cells[map.allTimeHigh] || "" : "",
    };
    if (row.name && row.buyPrice && row.units) rows.push(row);
  }
  if (!rows.length) throw new Error("No valid rows found.");
  return rows;
}

function parseCSV(text) {
  const result = parseMyPortfolioCSV(text);
  if (result) return result;
  return parseGenericCSV(text);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddTrade({ onAdd }) {
  const [mode, setMode] = useState("quick"); // quick | manual | csv
  const [nlText, setNlText] = useState("");
  const [nlParsed, setNlParsed] = useState(null);
  const [nlError, setNlError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [csvRows, setCsvRows] = useState(null);
  const [csvError, setCsvError] = useState("");
  const fileRef = useRef();

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  // Quick add NL parsing
  function handleNLParse() {
    const parsed = parseNLPosition(nlText);
    if (!parsed) {
      setNlError("Couldn't parse. Try: \"bought 100 ITC at 300\" or \"ITC 100 @ 300\"");
      setNlParsed(null);
      return;
    }
    const extras = parseNLExtras(nlText);
    setNlParsed({ ...parsed, currentPrice: parsed.buyPrice, ...extras });
    setNlError("");
  }

  function handleNLConfirm() {
    onAdd(nlParsed);
    setNlText("");
    setNlParsed(null);
  }

  // Manual form submit
  function submitManual() {
    if (!form.name || !form.buyPrice || !form.currentPrice || !form.units) {
      setFormError("Name, Buy Price, Current Price, and Units are required.");
      return;
    }
    setFormError("");
    onAdd(form);
    setForm(EMPTY);
  }

  // CSV
  function handleCsvFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try { setCsvRows(parseCSV(e.target.result)); setCsvError(""); }
      catch (err) { setCsvError(err.message); setCsvRows(null); }
    };
    reader.readAsText(file);
  }

  function importAll() {
    csvRows.forEach((row) => onAdd(row));
    setCsvRows(null);
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h2 className="text-lg font-bold text-white">Add Position</h2>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
        {[["quick", "Quick Add"], ["manual", "Manual"], ["csv", "Import CSV"]].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className={`flex-1 text-sm py-1.5 rounded transition-colors ${mode === id ? "bg-amber-500 text-black font-medium" : "text-slate-400 hover:text-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Quick Add ── */}
      {mode === "quick" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Type naturally: <span className="text-slate-400">"bought 100 ITC at 300"</span> or <span className="text-slate-400">"HFCL 500 @ 74 target 200"</span>
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-900 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 placeholder-slate-600"
              placeholder="e.g. bought 100 ITC at 300, target 500"
              value={nlText}
              onChange={(e) => setNlText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNLParse()}
            />
            <button onClick={handleNLParse}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm transition-colors">
              Parse
            </button>
          </div>

          {nlError && <p className="text-red-400 text-xs">{nlError}</p>}

          {nlParsed && (
            <div className="bg-slate-900 border border-amber-700 rounded-lg p-4 space-y-3">
              <p className="text-amber-400 text-xs uppercase tracking-wider font-medium">Parsed — confirm or edit</p>
              <div className="grid grid-cols-2 gap-3">
                <NLField label="Name" value={nlParsed.name} onChange={(v) => setNlParsed((p) => ({ ...p, name: v }))} />
                <NLField label="Units" value={nlParsed.units} onChange={(v) => setNlParsed((p) => ({ ...p, units: v }))} type="number" />
                <NLField label="Buy Price ₹" value={nlParsed.buyPrice} onChange={(v) => setNlParsed((p) => ({ ...p, buyPrice: v }))} type="number" />
                <NLField label="Current Price ₹" value={nlParsed.currentPrice} onChange={(v) => setNlParsed((p) => ({ ...p, currentPrice: v }))} type="number" />
                <NLField label="Target ₹" value={nlParsed.target || ""} onChange={(v) => setNlParsed((p) => ({ ...p, target: v }))} type="number" />
                <NLField label="ATH ₹" value={nlParsed.allTimeHigh || ""} onChange={(v) => setNlParsed((p) => ({ ...p, allTimeHigh: v }))} type="number" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleNLConfirm}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded transition-colors text-sm">
                  Add Position
                </button>
                <button onClick={() => setNlParsed(null)}
                  className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Manual Form ── */}
      {mode === "manual" && (
        <div className="space-y-4">
          {formError && <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded px-3 py-2">{formError}</p>}
          <Field label="Stock Name *" placeholder="e.g. ITC" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Buy Date" type="date" value={form.buyDate} onChange={(v) => set("buyDate", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Buy Price ₹ *" type="number" placeholder="100" value={form.buyPrice} onChange={(v) => set("buyPrice", v)} />
            <Field label="Current Price ₹ *" type="number" placeholder="120" value={form.currentPrice} onChange={(v) => set("currentPrice", v)} />
          </div>
          <Field label="Units *" type="number" placeholder="500" value={form.units} onChange={(v) => set("units", v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target ₹" type="number" placeholder="Optional" value={form.target} onChange={(v) => set("target", v)} />
            <Field label="All Time High ₹" type="number" placeholder="Optional" value={form.allTimeHigh} onChange={(v) => set("allTimeHigh", v)} />
          </div>
          <button onClick={submitManual}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 rounded transition-colors">
            Add Position
          </button>
        </div>
      )}

      {/* ── CSV Import ── */}
      {mode === "csv" && (
        <div className="space-y-3">
          {!csvRows && (
            <div
              className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); handleCsvFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => e.preventDefault()}
            >
              <p className="text-white text-sm font-medium mb-1">Upload portfolio CSV</p>
              <p className="text-slate-500 text-xs">Supports your Google Sheets format</p>
              <p className="text-slate-600 text-xs mt-1">File → Download → CSV</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={(e) => handleCsvFile(e.target.files[0])} />
            </div>
          )}
          {csvError && <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded px-3 py-2">{csvError}</p>}
          {csvRows && (
            <div>
              <p className="text-slate-400 text-sm mb-3">Found <span className="text-white font-medium">{csvRows.length}</span> positions:</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto mb-4">
                {csvRows.map((r, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm flex items-center justify-between">
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="text-slate-400 text-xs">Buy ₹{r.buyPrice} · {r.units} units{r.currentPrice ? ` · Current ₹${r.currentPrice}` : ""}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={importAll} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded transition-colors">
                  Import All ({csvRows.length})
                </button>
                <button onClick={() => setCsvRows(null)} className="px-4 bg-slate-800 text-slate-400 rounded text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 placeholder-slate-600 transition-colors" />
    </div>
  );
}

function NLField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
    </div>
  );
}

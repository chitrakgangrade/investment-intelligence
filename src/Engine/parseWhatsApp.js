// Ported directly from ~/My_KB/vimal_analysis.py — TICKER_LOOKUP
// Keys: lowercase fragments as they appear in Vimal's WhatsApp messages
// Values: NSE ticker (Yahoo Finance format)
const TICKER_LOOKUP = {
  // === BANKS / NBFC ===
  "pnb": "PNB.NS", "punjab national": "PNB.NS",
  "bob": "BANKBARODA.NS", "bank of baroda": "BANKBARODA.NS",
  "federal": "FEDERALBNK.NS", "federal bank": "FEDERALBNK.NS",
  "icici": "ICICIBANK.NS", "hdfc bank": "HDFCBANK.NS",
  "rbl bank": "RBLBANK.NS", "rbl": "RBLBANK.NS",
  "idbi": "IDBI.NS", "j&k bank": "JKBANK.NS",
  "karur vysya": "KARURVYSYA.NS", "csb bank": "CSBBANK.NS", "csb": "CSBBANK.NS",
  "jm financial": "JMFINANCL.NS", "jm financl": "JMFINANCL.NS", "jm balaji": "JMFINANCL.NS",
  "edelweiss": "EDELWEISS.NS", "manappuram": "MANAPPURAM.NS", "manapuram": "MANAPPURAM.NS",
  "muthoot": "MUTHOOTFIN.NS", "muthooth": "MUTHOOTFIN.NS",
  "shriram financial": "SHRIRAMFIN.NS", "shriram fin": "SHRIRAMFIN.NS",
  "sammaan": "SAMMAANCAP.NS", "samman": "SAMMAANCAP.NS",
  "religare": "RELIGARE.NS",
  "bank of india": "BANKINDIA.NS", "bankindia": "BANKINDIA.NS",
  "lic housing": "LICHSGFIN.NS", "ibull housing": "IBULHSGFIN.NS",
  "federal mort": "FEDFINA.NS",
  "asit c mehta": "ACML.NS", "asit mehta": "ACML.NS",
  "emkay global": "EMKAY.NS", "emkay": "EMKAY.NS",
  "capacity infra": "CAPACITE.NS",

  // === LARGE CAP / BLUE CHIP ===
  "grasim": "GRASIM.NS", "upl": "UPL.NS",
  "adani power": "ADANIPOWER.NS",
  "pi ind": "PIIND.NS", "pi industries": "PIIND.NS",
  "aurobindo": "AUROPHARMA.NS", "aurbindo": "AUROPHARMA.NS",
  "ntpc": "NTPC.NS", "wipro": "WIPRO.NS",
  "coal india": "COALINDIA.NS", "ambuja": "AMBUJACEM.NS",
  "sail": "SAIL.NS", "ongc": "ONGC.NS", "nmdc": "NMDC.NS",
  "jspl": "JINDALSTEL.NS", "itc": "ITC.NS", "sun tv": "SUNTV.NS",
  "hal": "HAL.NS", "bharat forge": "BHARATFORG.NS",

  // === FINANCE / INSURANCE ===
  "confidence petro": "CONFIPET.NS", "confidence petroleum": "CONFIPET.NS", "confipet": "CONFIPET.NS",
  "confidence futuristic": "CONFICHEMCO.NS",
  "new india assurance": "NIACL.NS", "niacl": "NIACL.NS",
  "ge shipping": "GESHIP.NS", "exide": "EXIDEIND.NS",
  "bf utility": "BFUTILITIE.NS", "bf investment": "BFINVEST.NS",
  "wockhardt": "WOCKPHARMA.NS",
  "vakrangi": "VAKRANGEE.NS", "vakrangee": "VAKRANGEE.NS",
  "ibull pp": "IBULINVST.NS",

  // === TELECOM / TECH ===
  "hfcl": "HFCL.NS",
  "industower": "INDUSTOWER.NS", "indus tower": "INDUSTOWER.NS",
  "subex": "SUBEX.NS",
  "vindhya tele": "VINDHYATEL.NS", "vindhya": "VINDHYATEL.NS",
  "balaji tele": "BALAJITELE.NS", "balaji telefilms": "BALAJITELE.NS", "balji tele": "BALAJITELE.NS",
  "kaynes tech": "KAYNES.NS", "kaynes": "KAYNES.NS",
  "timetechno": "TIMETECHNO.NS", "megasoft": "MEGASOFT.NS",

  // === REAL ESTATE ===
  "anantraj": "ANANTRAJ.NS", "tarc": "TARC.NS",
  "dlf": "DLF.NS", "sobha": "SOBHA.NS",
  "db reality": "DBREALTY.NS", "db realty": "DBREALTY.NS",
  "godrej property": "GODREJPROP.NS", "godrej prop": "GODREJPROP.NS",
  "mahindra life": "MAHLIFE.NS", "mahindralife": "MAHLIFE.NS",
  "ibull real": "IBREALEST.NS", "ibrealest": "IBREALEST.NS",
  "dilip buildcon": "DBL.NS", "dilip": "DBL.NS",
  "navkar corp": "NAVKARCORP.NS", "navkar": "NAVKARCORP.NS",

  // === METALS / MINING ===
  "lloyed metal": "LLOYDMETAL.NS", "lloyed steel": "LLOYDSTEEL.NS",
  "lloyed enterprise": "LLOYDSENGG.NS", "lloyd metal": "LLOYDMETAL.NS",
  "maharashtra seamless": "MAHASEAMLES.NS", "maharastra seamless": "MAHASEAMLES.NS",
  "sandur": "SANDUMA.NS",
  "jindal saw": "JINDALSAW.NS", "jindalsaw": "JINDALSAW.NS",
  "tisco": "TATASTEEL.NS", "tata steel": "TATASTEEL.NS",
  "heg": "HEG.NS", "graphite": "GRAPHITEI.NS",
  "imfa": "IMFA.NS", "sunflag": "SUNFLAG.NS",
  "jindal hisar": "JINDALSTEL.NS", "jindal drilling": "JINDALDRIL.NS",
  "electrosteel": "ELECTCAST.NS",

  // === POWER / ENERGY / INFRA ===
  "jp power": "JPPOWER.NS", "jppower": "JPPOWER.NS",
  "jp associate": "JPASSOCIAT.NS",
  "rpower": "RPOWER.NS", "r power": "RPOWER.NS",
  "rel infra": "RELINFRA.NS", "reliance infra": "RELINFRA.NS",
  "hudco": "HUDCO.NS", "sepc": "SEPC.NS", "hcc": "HCC.NS",
  "isgec": "ISGEC.NS", "pcbl": "PCBL.NS", "philip carbon": "PCBL.NS",
  "bgr energy": "BGRENERGY.NS", "nbcc": "NBCC.NS",
  "sw solar": "SWSOLAR.NS", "rajratan": "RAJRATAN.NS",
  "ptc ind": "PTCIL.NS", "ptc": "PTCIL.NS",
  "irb": "IRB.NS", "ncc": "NCC.NS",

  // === PHARMA / HEALTHCARE ===
  "biocon": "BIOCON.NS",
  "venus remedies": "VENUSREM.NS",
  "bliss gvs": "BLISSGVS.NS", "bliss": "BLISSGVS.NS",
  "dishman": "DCAL.NS",
  "sms pharma": "SMSPHARMA.NS",
  "iil": "IIL.NS",
  "heranba": "HERANBA.NS", "hernaba": "HERANBA.NS",

  // === AUTO / TRANSPORT ===
  "jbm": "JBMA.NS", "olectra": "OLECTRA.NS",
  "texmeco rail": "TEXRAIL.NS", "texmaco rail": "TEXRAIL.NS", "texmeco": "TEXRAIL.NS",
  "ags transact": "AGSTRA.NS", "ags": "AGSTRA.NS",
  "spicejet": "SPICEJET.NS", "spice jet": "SPICEJET.NS",

  // === CHEMICALS ===
  "rain": "RAIN.NS", "rain ind": "RAIN.NS", "rain industries": "RAIN.NS",
  "ghcl": "GHCL.NS", "laxmi organics": "LXCHEM.NS", "lxchem": "LXCHEM.NS",
  "ashapura": "ASHAPURMIN.NS", "dcw": "DCW.NS",
  "primochem": "PRIMOCHEM.NS", "primo chem": "PRIMOCHEM.NS",
  "camlin fine": "CAMLINFINE.NS", "camlinfine": "CAMLINFINE.NS",
  "ghcl textile": "GHCLTEXTIL.NS",

  // === AGRICULTURE / FMCG ===
  "basant agro": "BASANTAGRO.NS", "basantagro": "BASANTAGRO.NS",
  "jain irrigation": "JAILAGRI.NS",
  "parag milk": "PARAGMILK.NS",
  "heritage food": "HERITGFOOD.NS",
  "bajaj hindusthan": "BAJAJHIND.NS", "bajaj hind": "BAJAJHIND.NS",
  "advance agro": "ADVANCEAGRO.NS",

  // === MEDIA / ENTERTAINMENT ===
  "zee entertainment": "ZEEL.NS", "zee": "ZEEL.NS",
  "tv18": "TV18BRDCST.NS",
  "dish tv": "DISHTV.NS",
  "eros": "EROSMEDIA.NS",

  // === LOGISTICS / INFRA ===
  "gr infra": "GRINFRA.NS",
  "mep infra": "MEPINFRA.NS", "mep": "MEPINFRA.NS",
  "allcargo": "ALLCARGO.NS", "gati": "GATI.NS",
  "man infra": "MANINFRA.NS",
  "tpl plast": "TPLPLAST.NS", "tpl": "TPLPLAST.NS",
  "charter logistics": "CHARTERLOG.NS", "chartered logistics": "CHARTERLOG.NS",
  "container corp": "CONCOR.NS", "concor": "CONCOR.NS",

  // === TEXTILES ===
  "alok": "ALOKTEXT.NS", "alok ind": "ALOKTEXT.NS", "alok industries": "ALOKTEXT.NS",
  "bombay dying": "BOMDYEING.NS", "bombay dyeing": "BOMDYEING.NS",
  "kriti ind": "KRITIIND.NS", "kriti nutrients": "KRITINU.NS",
  "duroply": "DUROPLY.NS",

  // === SME / SMALL CAP ===
  "ekansh concept": "EKANSHCON.NS", "ekansh": "EKANSHCON.NS",
  "mk venture": "MKVENTURE.NS",
  "golkunda diamonds": "GOLKDIAM.NS", "golkunda": "GOLKDIAM.NS",
  "tarsons": "TARSONS.NS",
  "pgel": "PGEL.NS", "pg electroplast": "PGEL.NS",
  "pg foils": "PGFOILS.NS", "pgfoils": "PGFOILS.NS",
  "ekc": "EKC.NS",
  "haldyn glass": "HALDYNGLAS.NS", "haldyn": "HALDYNGLAS.NS",
  "somi conveyor": "SOMICONVEY.NS",
  "mcleod russell": "MCLEODRUSS.NS", "mcleod": "MCLEODRUSS.NS",
  "lux": "LUXIND.NS",
  "steel exchange": "STEELXIND.NS",
  "vishnu prakash": "VPIL.NS",
  "kuantum paper": "KUANTUM.NS", "kuantum": "KUANTUM.NS",
  "jct": "JCTLT.NS",
  "om infra": "OMINFRAL.NS", "ominfra": "OMINFRAL.NS",
  "epack": "EPACKDURA.NS",
  "godrej ind": "GODREJIND.NS", "godrej industries": "GODREJIND.NS",
  "dhani services": "DHANI.NS", "dhani": "DHANI.NS",
  "ratan power": "RTNPOWER.NS",
  "kaya": "KAYA.NS", "nidan": "NIDAN.NS",
  "kalyan jewellers": "KALYANKJIL.NS", "kalyan": "KALYANKJIL.NS",
  "deccan gold": "DGLD.NS",
  "cravatex": "CRAVATEX.NS",
  "imagica": "ADLABS.NS",
  "sahyadri": "SAHYADRI.NS",
  "kriti": "KRITIIND.NS",
  "shigen": "FIEMIND.NS",

  // === 2026 GROUP ===
  "future": "FUTUREENTERPRISES.NS", "future enterprises": "FUTUREENTERPRISES.NS",
  "can": "CANBK.NS", "canara": "CANBK.NS", "canara bank": "CANBK.NS",
  "methodhub": "METHODHUB.NS", "cssl": "CSSL.NS",
  "neetu yoshi": "NEETUYOSHI.NS", "neetuyoshi": "NEETUYOSHI.NS",
  "italian edibles": "ITALEDIBLE.NS",
  "lt elevator": "LTELEVATOR.NS",
  "shanti gold": "SHANTIGOLD.NS",
  "utssav": "UTSSAV.NS", "utsaav": "UTSSAV.NS",
  "ahimsa": "AHIMSAIND.NS", "embdl": "EMBDL.NS",
  "ashwini": "ASHWINFI.NS",
  "lotus": "LOTUSEYEHOS.NS",
  "jyoti structures": "JYOTISTRUC.NS",
  "pg": "PGEL.NS",
  "bbtc": "BBTC.NS",
  "nalwa": "NALWACONS.NS",
};

const SKIP_KEYWORDS = [
  "omitted", "deleted", " added ", " removed ", " changed ",
  " created ", "turned on", "disappearing", "https://", "http://",
  "youtu", "instagram", "facebook", "youtube",
];

// iOS format: [DD/MM/YYYY, HH:MM:SS] Name: message
// \s* (not \s+) allows empty message body; no $ anchor so \r doesn't break match
const MSG_PATTERN = /^\[(\d{1,2}\/\d{1,2}\/\d{4}),\s*\d{1,2}:\d{2}(?::\d{2})?\]\s+(.+?):\s*(.*)/;
const NEW_MSG_PATTERN = /^\[\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}/;

function buildLookup(portfolioNames) {
  const lookup = new Map(Object.entries(TICKER_LOOKUP));
  for (const name of portfolioNames) {
    const key = name.toLowerCase().trim();
    if (!lookup.has(key)) lookup.set(key, name.toUpperCase());
  }
  return lookup;
}

function findStocks(text, lookup) {
  const lower = text.toLowerCase();
  const found = [];
  const usedTickers = new Set();
  const usedPositions = new Set();

  const sortedKeys = [...lookup.keys()].sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    let start = 0;
    while (start < lower.length) {
      const idx = lower.indexOf(key, start);
      if (idx === -1) break;
      const end = idx + key.length;

      const beforeOk = idx === 0 || !/[a-z0-9]/.test(lower[idx - 1]);
      const afterOk = end >= lower.length || !/[a-z0-9]/.test(lower[end]);

      if (beforeOk && afterOk) {
        const hasOverlap = Array.from({ length: end - idx }, (_, i) => idx + i).some((p) =>
          usedPositions.has(p)
        );
        if (!hasOverlap) {
          const ticker = lookup.get(key);
          if (!usedTickers.has(ticker)) {
            found.push({ ticker, name: key });
            usedTickers.add(ticker);
            for (let i = idx; i < end; i++) usedPositions.add(i);
          }
        }
      }
      start = idx + 1;
    }
  }
  return found;
}

// Parse "DD/MM/YYYY" → Date
function parseWADate(str) {
  if (!str) return null;
  const p = str.split("/");
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}

// Extracts the WhatsApp group name from the system message in the first few lines.
// iOS exports: "[date] GroupName: ‎Messages and calls are end-to-end encrypted."
export function extractGroupName(text) {
  const lines = text.split(/\r?\n/).slice(0, 10);
  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f\u200b\u202a\u202c\u202d\uFEFF]/g, "").trim();
    if (line.toLowerCase().includes("messages and calls are end-to-end encrypted")) {
      const m = line.match(/^\[.*?\]\s+(.+?):/);
      if (m) return m[1].trim();
    }
  }
  // Fallback: use the first message sender as group identifier
  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f\u200b\u202a\u202c\u202d\uFEFF]/g, "").trim();
    const m = line.match(MSG_PATTERN);
    if (m) return m[2].trim(); // sender name
  }
  return "default";
}

// Returns the date string of the last message in the file (for delta tracking)
export function getLastMessageDate(text) {
  const lines = text.split(/\r?\n/);
  let lastDate = null;
  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f\u200b\u202a\u202c\u202d\uFEFF]/g, "").trim();
    const m = line.match(MSG_PATTERN);
    if (m) lastDate = m[1];
  }
  return lastDate;
}

// afterDateStr: "DD/MM/YYYY" — only process messages AFTER this date (exclusive)
export function parseWhatsApp(text, portfolioNames = [], afterDateStr = null) {
  const lookup = buildLookup(portfolioNames);
  const lines = text.split(/\r?\n/);
  const mentions = {};
  const afterDate = afterDateStr ? parseWADate(afterDateStr) : null;

  let currentDate = null;
  let currentMsg = null;
  let inVimalMsg = false;

  function processMessage() {
    if (!inVimalMsg || !currentMsg) return;
    const msgLower = currentMsg.toLowerCase();
    if (SKIP_KEYWORDS.some((k) => msgLower.includes(k))) return;

    const found = findStocks(currentMsg, lookup);
    for (const { ticker, name } of found) {
      if (!mentions[ticker]) {
        mentions[ticker] = {
          ticker,
          displayName: name,
          count: 0,
          firstDate: currentDate,
          lastDate: currentDate,
          messages: [],
        };
      }
      mentions[ticker].count++;
      mentions[ticker].lastDate = currentDate;
      if (mentions[ticker].messages.length < 3) {
        mentions[ticker].messages.push({
          date: currentDate,
          text: currentMsg.trim().slice(0, 200),
        });
      }
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f\u200b\u202a\u202c\u202d\uFEFF]/g, "").trim();

    const m = line.match(MSG_PATTERN);
    if (m) {
      processMessage();
      const [, date, sender, msg] = m;
      currentDate = date;

      // Delta: skip messages on or before the last processed date
      if (afterDate !== null) {
        const msgDate = parseWADate(date);
        if (msgDate && msgDate <= afterDate) {
          inVimalMsg = false;
          currentMsg = null;
          continue;
        }
      }

      const cleanSender = sender.replace(/[\u200e\u200f\u200b\u202a\u202c\u202d\uFEFF]/g, "").trim();
      inVimalMsg = cleanSender.toLowerCase().includes("vimal parwal");
      currentMsg = inVimalMsg ? msg : null;
    } else if (NEW_MSG_PATTERN.test(line)) {
      processMessage();
      inVimalMsg = false;
      currentMsg = null;
    } else if (inVimalMsg && currentMsg !== null) {
      currentMsg += " " + line.trim();
    }
  }
  processMessage();

  return Object.values(mentions).sort((a, b) => b.count - a.count);
}

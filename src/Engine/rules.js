export function applyRules(position) {
  const current = Number(position.currentPrice);
  const entry = Number(position.buyPrice);
  const days = Math.floor((Date.now() - new Date(position.buyDate)) / 86400000);
  const ath = position.allTimeHigh ? Number(position.allTimeHigh) : null;
  const target = position.target ? Number(position.target) : null;
  const rules = [];

  // 1. Stop Loss -60%
  if (current <= entry * 0.4) {
    rules.push({ type: "SELL_ALL", reason: "Stop Loss -60%", action: "SELL 100%", priority: 1 });
  } else if (current <= entry * 0.45) {
    // 2. Near Stop Loss -55%
    rules.push({ type: "WARNING", reason: "Near Stop Loss -55%", action: "WATCH", priority: 2 });
  }

  // 3. Quick Pop +20% in 30 days
  if (days <= 30 && current >= entry * 1.2) {
    rules.push({ type: "PARTIAL_SELL", reason: "Quick Pop +20% in 30d", action: "SELL 25%", priority: 3 });
  }

  // 4. Target hit
  if (target && current >= target) {
    rules.push({ type: "PARTIAL_SELL", reason: "Target Hit", action: "SELL 50%", priority: 2 });
  }

  // 5 & 6. Gain thresholds (mutually exclusive — higher wins)
  if (current >= entry * 2) {
    rules.push({ type: "PARTIAL_SELL", reason: "+100% Gain", action: "SELL 50%", priority: 3 });
  } else if (current >= entry * 1.5) {
    rules.push({ type: "PARTIAL_SELL", reason: "+50% Gain", action: "SELL 25%", priority: 4 });
  }

  // 7. Near ATH (within 10% of all-time high)
  if (ath && current >= ath * 0.9) {
    rules.push({ type: "PARTIAL_SELL", reason: "Near ATH (90%)", action: "SELL 50%", priority: 2 });
  }

  // 8. 1-year holding expiry
  if (days >= 365) {
    rules.push({ type: "SELL_ALL", reason: "1 Year Hold Expired", action: "SELL 100%", priority: 1 });
  }

  return rules.sort((a, b) => a.priority - b.priority);
}

export function categorize(positions) {
  const sellAll = [], partialSell = [], warnings = [], holds = [];

  for (const p of positions) {
    const rules = applyRules(p);
    if (!rules.length) {
      holds.push({ position: p, rules: [] });
      continue;
    }
    const top = rules[0];
    const entry = { position: p, signal: top, rules };
    if (top.type === "SELL_ALL") sellAll.push(entry);
    else if (top.type === "PARTIAL_SELL") partialSell.push(entry);
    else warnings.push(entry);
  }

  return { sellAll, partialSell, warnings, holds };
}

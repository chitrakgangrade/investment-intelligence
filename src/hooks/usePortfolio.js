import { useState, useEffect } from "react";

const KEY = "ii_portfolio_v2";

// Module-level counter ensures unique IDs even during rapid bulk imports
let _idSeq = Date.now();
const nextId = () => ++_idSeq;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const d = raw ? JSON.parse(raw) : {};
    return {
      positions: d.positions || [],
      notes: d.notes || {},
      recommendations: d.recommendations || {},
      signalLogs: d.signalLogs || [],
      chatGroups: d.chatGroups || {},   // { groupName: lastProcessedDate }
    };
  } catch {
    return { positions: [], notes: {}, recommendations: {}, signalLogs: [], chatGroups: {} };
  }
}

export function usePortfolio() {
  const [data, setData] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  function addPosition(form) {
    const pos = {
      id: nextId(),
      name: form.name.toUpperCase().trim(),
      buyDate: form.buyDate || new Date().toISOString().split("T")[0],
      buyPrice: Number(form.buyPrice),
      currentPrice: Number(form.currentPrice) || Number(form.buyPrice),
      units: Number(form.units),
      target: form.target ? Number(form.target) : null,
      allTimeHigh: form.allTimeHigh ? Number(form.allTimeHigh) : null,
    };
    setData((d) => ({ ...d, positions: [...d.positions, pos] }));
  }

  function updateCurrentPrice(id, price) {
    setData((d) => ({
      ...d,
      positions: d.positions.map((p) =>
        p.id === id ? { ...p, currentPrice: Number(price) } : p
      ),
    }));
  }

  function deletePosition(id) {
    setData((d) => ({
      ...d,
      positions: d.positions.filter((p) => p.id !== id),
    }));
  }

  function saveNote(name, note) {
    setData((d) => ({ ...d, notes: { ...d.notes, [name]: note } }));
  }

  function saveSignals(signals, lastMsgDate, groupName) {
    setData((d) => {
      const recs = { ...d.recommendations };
      for (const s of signals) {
        if (recs[s.ticker]) {
          recs[s.ticker] = {
            ...recs[s.ticker],
            count: recs[s.ticker].count + s.count,
            lastDate: s.lastDate,
            messages: [...(recs[s.ticker].messages || []), ...s.messages].slice(-10),
          };
        } else {
          recs[s.ticker] = { ...s };
        }
      }

      const log = {
        id: Date.now(),
        savedAt: new Date().toISOString(),
        groupName,
        processedAfter: d.chatGroups[groupName] || null,
        lastMessageDate: lastMsgDate,
        stockCount: signals.length,
        newStocks: signals.filter((s) => !d.recommendations[s.ticker]).length,
        totalMentions: signals.reduce((sum, s) => sum + s.count, 0),
      };

      return {
        ...d,
        recommendations: recs,
        signalLogs: [log, ...(d.signalLogs || [])].slice(0, 30),
        chatGroups: { ...d.chatGroups, [groupName]: lastMsgDate },
      };
    });
  }

  function resetSignals(groupName) {
    setData((d) => {
      const groups = { ...d.chatGroups };
      if (groupName) delete groups[groupName];
      else Object.keys(groups).forEach((k) => delete groups[k]);
      return {
        ...d,
        recommendations: groupName ? d.recommendations : {},
        signalLogs: groupName
          ? d.signalLogs.filter((l) => l.groupName !== groupName)
          : [],
        chatGroups: groups,
      };
    });
  }

  return {
    positions: data.positions,
    notes: data.notes,
    recommendations: data.recommendations,
    signalLogs: data.signalLogs,
    chatGroups: data.chatGroups,
    addPosition,
    updateCurrentPrice,
    deletePosition,
    saveNote,
    saveSignals,
    resetSignals,
  };
}

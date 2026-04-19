import { useState } from "react";
import { usePortfolio } from "./hooks/usePortfolio";
import Nav from "./components/Nav";
import Dashboard from "./components/Dashboard";
import Portfolio from "./components/Portfolio";
import AddTrade from "./components/AddTrade";
import DailyBrief from "./components/DailyBrief";
import WhatsAppIntel from "./components/WhatsAppIntel";
import Recommendations from "./components/Recommendations";
import KnowledgeBase from "./components/KnowledgeBase";

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const {
    positions, notes,
    recommendations, signalLogs, chatGroups,
    addPosition, updateCurrentPrice, deletePosition, saveNote,
    saveSignals, resetSignals,
  } = usePortfolio();

  function handleAdd(form) {
    addPosition(form);
    setTab("portfolio");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav tab={tab} setTab={setTab} positionCount={positions.length} />
      {tab === "dashboard" && <Dashboard positions={positions} />}
      {tab === "portfolio" && (
        <Portfolio positions={positions} onUpdatePrice={updateCurrentPrice} onDelete={deletePosition} />
      )}
      {tab === "add" && <AddTrade onAdd={handleAdd} />}
      {tab === "brief" && <DailyBrief positions={positions} />}
      {tab === "signals" && (
        <WhatsAppIntel
          positions={positions}
          chatGroups={chatGroups}
          signalLogs={signalLogs}
          onSaveSignals={saveSignals}
          onResetSignals={resetSignals}
        />
      )}
      {tab === "recommendations" && (
        <Recommendations recommendations={recommendations} positions={positions} />
      )}
      {tab === "kb" && (
        <KnowledgeBase positions={positions} notes={notes} onSaveNote={saveNote} />
      )}
    </div>
  );
}

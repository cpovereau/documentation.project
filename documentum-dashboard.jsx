import { useState } from "react";

const initialModules = [
  {
    id: 1, name: "CentralEditor", axe: "Core", status: "done", progress: 100,
    tasks: [
      { id: 1, title: "Phase 1 — Buffer & sync TipTap", axe: "Core", priority: "high", status: "done", tag: "Frontend" },
      { id: 2, title: "Phase 2 — Allègement structurel", axe: "Core", priority: "medium", status: "done", tag: "Frontend" },
      { id: 3, title: "Phase 3 — Parsing XML ⇄ TipTap", axe: "Core", priority: "high", status: "done", tag: "Backend" },
      { id: 4, title: "Phase 4 — Sauvegarde backend + validation XML", axe: "Core", priority: "high", status: "done", tag: "Backend" },
      { id: 5, title: "Phase 5 — Guard de navigation", axe: "Core", priority: "medium", status: "done", tag: "Frontend" },
    ]
  },
  {
    id: 2, name: "LeftSidebar", axe: "Core", status: "done", progress: 100,
    tasks: [
      { id: 6, title: "Lot 1 — Chaîne de sélection", axe: "Core", priority: "high", status: "done", tag: "Frontend" },
      { id: 7, title: "Lot 2 — Routes canoniques", axe: "Core", priority: "high", status: "done", tag: "Backend" },
      { id: 8, title: "Lot 3 — CRUD projets & rubriques", axe: "Core", priority: "high", status: "done", tag: "Backend" },
      { id: 9, title: "Lot 4 — Qualité code & hooks", axe: "Core", priority: "medium", status: "done", tag: "Frontend" },
      { id: 10, title: "Lot 5 — Publication / Export", axe: "Core", priority: "medium", status: "done", tag: "Frontend" },
    ]
  },
  {
    id: 3, name: "Map", axe: "Core", status: "active", progress: 50,
    tasks: [
      { id: 11, title: "Stabilisation structure", axe: "Core", priority: "high", status: "done", tag: "Frontend" },
      { id: 12, title: "Création rubrique (route canonique atomique)", axe: "Core", priority: "high", status: "done", tag: "Backend" },
      { id: 13, title: "Reorder / indent / outdent + persistance", axe: "Core", priority: "high", status: "done", tag: "Backend" },
      { id: 14, title: "Rechargement systématique après opération", axe: "Core", priority: "medium", status: "done", tag: "Frontend" },
      { id: 15, title: "Clone & suppression depuis toolbar", axe: "Core", priority: "medium", status: "in-progress", tag: "Frontend" },
      { id: 16, title: "Route attach rubrique existante", axe: "Core", priority: "medium", status: "in-progress", tag: "Backend" },
      { id: 17, title: "Drag & drop cross-niveau", axe: "Core", priority: "low", status: "todo", tag: "Frontend" },
      { id: 18, title: "Évolutions UX (rendu racine, icônes)", axe: "Core", priority: "low", status: "todo", tag: "Frontend" },
    ]
  },
  {
    id: 4, name: "ProductDocSync", axe: "Pilotage", status: "active", progress: 33,
    tasks: [
      { id: 19, title: "Phase 1 — Branchement API fonctionnalités", axe: "Pilotage", priority: "high", status: "done", tag: "Backend" },
      { id: 20, title: "Phase 2 — VersionProduit + EvolutionProduit (21/21 tests)", axe: "Pilotage", priority: "high", status: "done", tag: "Backend" },
      { id: 21, title: "Phase B — Nettoyage code legacy ← MAINTENANT", axe: "Pilotage", priority: "high", status: "todo", tag: "Frontend" },
      { id: 22, title: "Phase 3 — ImpactDocumentaire (modèle M1 + API)", axe: "Pilotage", priority: "high", status: "todo", tag: "Backend" },
      { id: 23, title: "Phase 4 — Plan de test & carte d'impact", axe: "Pilotage", priority: "medium", status: "todo", tag: "Backend" },
      { id: 24, title: "Phase 5 — Nettoyage & stabilisation finale", axe: "Pilotage", priority: "low", status: "todo", tag: "Backend" },
    ]
  },
  {
    id: 5, name: "RightSidebar", axe: "Core", status: "active", progress: 25,
    tasks: [
      { id: 25, title: "Phase 1 — Branchement API médiathèque", axe: "Core", priority: "high", status: "done", tag: "Frontend" },
      { id: 26, title: "Phase 2 — Pagination & chargement différé", axe: "Core", priority: "medium", status: "todo", tag: "Backend" },
      { id: 27, title: "Phase 3 — Insertion image dans CentralEditor", axe: "Core", priority: "medium", status: "todo", tag: "Frontend" },
      { id: 28, title: "Phase 4 — Évolutions UX", axe: "Core", priority: "low", status: "todo", tag: "Frontend" },
    ]
  },
  {
    id: 6, name: "Settings", axe: "Core", status: "active", progress: 50,
    tasks: [
      { id: 29, title: "Phase 1 — DataTab", axe: "Core", priority: "medium", status: "done", tag: "Frontend" },
      { id: 30, title: "Autres onglets (en cours)", axe: "Core", priority: "medium", status: "in-progress", tag: "Frontend" },
    ]
  },
];

const axes = [
  { name: "Core", role: "Core documentaire", avatar: "CO", color: "#6366f1" },
  { name: "Pilotage", role: "Pilotage documentaire", avatar: "PI", color: "#f59e0b" },
  { name: "Nexus", role: "Base Métier / API", avatar: "NX", color: "#10b981" },
];

const tagColors = {
  Backend:  { bg: "#1e293b", text: "#38bdf8", border: "#0284c7" },
  Frontend: { bg: "#1e293b", text: "#a78bfa", border: "#7c3aed" },
  Infra:    { bg: "#1e293b", text: "#fb923c", border: "#ea580c" },
  Tests:    { bg: "#1e293b", text: "#34d399", border: "#059669" },
};

const statusConfig = {
  done:        { label: "Terminé",  color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  "in-progress": { label: "En cours", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  todo:        { label: "À faire",  color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
};

const priorityDot = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

const moduleStatusConfig = {
  done:    { label: "Terminé",  color: "#10b981" },
  active:  { label: "En cours", color: "#f59e0b" },
  planned: { label: "Planifié", color: "#6366f1" },
};

export default function DocumentumDashboard() {
  const [modules, setModules] = useState(initialModules);
  const [activeModule, setActiveModule] = useState(4);
  const [activeTab, setActiveTab] = useState("board");
  const [filter, setFilter] = useState("all");

  const currentModule = modules.find(m => m.id === activeModule);

  const allTasks = modules.flatMap(m => m.tasks);
  const totalDone = allTasks.filter(t => t.status === "done").length;
  const totalTasks = allTasks.length;
  const globalProgress = Math.round((totalDone / totalTasks) * 100);

  const filteredTasks = filter === "all"
    ? currentModule.tasks
    : currentModule.tasks.filter(t => t.axe === filter || t.status === filter || t.tag === filter);

  function cycleStatus(taskId) {
    const order = ["todo", "in-progress", "done"];
    setModules(prev => prev.map(mod => {
      const updatedTasks = mod.tasks.map(t => {
        if (t.id !== taskId) return t;
        const next = order[(order.indexOf(t.status) + 1) % order.length];
        return { ...t, status: next };
      });
      const done = updatedTasks.filter(t => t.status === "done").length;
      return {
        ...mod,
        tasks: updatedTasks,
        progress: Math.round((done / updatedTasks.length) * 100),
      };
    }));
  }

  const columns = ["todo", "in-progress", "done"];
  const nextAction = "ProductDocSync Phase B — Nettoyage code legacy";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
    }}>
      {/* Noise */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        opacity: 0.6,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>CCMS DITA — Documentum Nexus</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -1, color: "#f8fafc" }}>
              Pilotage projet
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              Suivi des modules — mis à jour 2026-04-18
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {axes.map(a => (
              <div key={a.name} title={`${a.name} — ${a.role}`} style={{
                width: 38, height: 38, borderRadius: "50%",
                background: a.color + "22", border: `2px solid ${a.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: a.color, cursor: "default",
              }}>{a.avatar}</div>
            ))}
          </div>
        </div>

        {/* Next action banner */}
        <div style={{
          marginBottom: 28, padding: "12px 18px", borderRadius: 10,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 6px #f59e0b", flexShrink: 0, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Prochaine action :</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>{nextAction}</span>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Progression globale", value: `${globalProgress}%`, sub: `${totalDone}/${totalTasks} phases`, accent: "#6366f1" },
            { label: "Module prioritaire", value: "Phase B", sub: "ProductDocSync legacy", accent: "#f59e0b" },
            { label: "Phases terminées", value: totalDone, sub: "sur 30 au total", accent: "#10b981" },
            { label: "Zones critiques", value: "7/7", sub: "toutes résolues ✅", accent: "#38bdf8" },
          ].map(kpi => (
            <div key={kpi.label} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: "20px 22px", borderTop: `2px solid ${kpi.accent}`,
            }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.accent, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Module selector */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {modules.map(mod => (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13, transition: "all 0.15s",
              background: activeModule === mod.id ? moduleStatusConfig[mod.status].color : "rgba(255,255,255,0.04)",
              color: activeModule === mod.id ? "#0a0f1e" : "#94a3b8",
              boxShadow: activeModule === mod.id ? `0 0 16px ${moduleStatusConfig[mod.status].color}44` : "none",
            }}>
              {mod.name}
              <span style={{ marginLeft: 8, fontSize: 11, color: activeModule === mod.id ? "#0a0f1e99" : moduleStatusConfig[mod.status].color }}>
                {mod.progress}%
              </span>
            </button>
          ))}
        </div>

        {/* Module progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>{currentModule.name}</span>
            <span style={{
              fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
              background: moduleStatusConfig[currentModule.status].color + "22",
              color: moduleStatusConfig[currentModule.status].color,
              border: `1px solid ${moduleStatusConfig[currentModule.status].color}44`,
            }}>
              {moduleStatusConfig[currentModule.status].label}
            </span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${currentModule.progress}%`,
              background: `linear-gradient(90deg, ${moduleStatusConfig[currentModule.status].color}, ${moduleStatusConfig[currentModule.status].color}aa)`,
              borderRadius: 99, transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 10, width: "fit-content" }}>
          {["board", "list"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 20px", borderRadius: 7, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13, transition: "all 0.15s",
              background: activeTab === tab ? "rgba(99,102,241,0.2)" : "transparent",
              color: activeTab === tab ? "#a5b4fc" : "#64748b",
            }}>
              {tab === "board" ? "📋 Kanban" : "📄 Liste"}
            </button>
          ))}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", "Core", "Pilotage", "todo", "in-progress", "done", "Backend", "Frontend"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "4px 12px", borderRadius: 20, border: "1px solid",
              cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.1s",
              borderColor: filter === f ? "#6366f1" : "rgba(255,255,255,0.08)",
              background: filter === f ? "rgba(99,102,241,0.15)" : "transparent",
              color: filter === f ? "#a5b4fc" : "#64748b",
            }}>
              {f === "all" ? "Tout" : f}
            </button>
          ))}
        </div>

        {/* KANBAN */}
        {activeTab === "board" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col);
              const cfg = statusConfig[col];
              return (
                <div key={col} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14, padding: 16, minHeight: 200,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8" }}>{cfg.label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color }}>
                      {colTasks.length}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {colTasks.map(task => {
                      const tc = tagColors[task.tag] || tagColors.Backend;
                      const axe = axes.find(a => a.name === task.axe);
                      return (
                        <div key={task.id} onClick={() => cycleStatus(task.id)}
                          style={{
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>{task.title}</span>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityDot[task.priority], flexShrink: 0, marginTop: 4 }} title={`Priorité ${task.priority}`} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                              background: tc.bg, color: tc.text, border: `1px solid ${tc.border}44`, letterSpacing: 0.5,
                            }}>{task.tag}</span>
                            {axe && (
                              <div style={{
                                width: 24, height: 24, borderRadius: "50%",
                                background: axe.color + "22", border: `1.5px solid ${axe.color}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 9, fontWeight: 700, color: axe.color,
                              }}>{axe.avatar}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {colTasks.length === 0 && (
                      <div style={{ textAlign: "center", color: "#334155", fontSize: 13, padding: "20px 0" }}>Aucune phase</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST VIEW */}
        {activeTab === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredTasks.map(task => {
              const cfg = statusConfig[task.status];
              const tc = tagColors[task.tag] || tagColors.Backend;
              const axe = axes.find(a => a.name === task.axe);
              return (
                <div key={task.id} onClick={() => cycleStatus(task.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10, padding: "14px 18px", cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityDot[task.priority], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{task.title}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}44` }}>{task.tag}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>{cfg.label}</span>
                  {axe && (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: axe.color + "22", border: `1.5px solid ${axe.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: axe.color, flexShrink: 0,
                    }}>{axe.avatar}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 32 }}>
          👉 Cliquez sur une carte pour faire avancer son statut
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

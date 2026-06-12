import { useState } from "react";
import {
  Trash2, Info, XCircle, AlertCircle, CheckCircle2, RotateCw, Globe, Eye, EyeOff, Terminal, ChevronDown, ChevronRight
} from "lucide-react";
import JsonInspector from "./JsonInspector";

const OutputPanel = ({
  srcDoc, consoleLogs, setConsoleLogs, onRefresh, isCompiling,
  expectedSrcDoc, showExpectedPreview, setShowExpectedPreview,
  hasActiveChallenge, hideExpectedOption,
  col3Height = 55, onDragStart
}) => {
  const [logFilter, setLogFilter] = useState("all");
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);

  const filteredLogs = consoleLogs.filter(log => {
    if (logFilter === "log" && log.type !== "log" && log.type !== "info") return false;
    if (logFilter !== "all" && logFilter !== "log" && log.type !== logFilter) return false;
    return true;
  });

  const consoleHeight = 100 - col3Height;
  const iframeSandbox = "allow-scripts allow-same-origin";

  return (
    <div className="h-full flex flex-col overflow-hidden gap-0">

      {/* Browser Panel (Top) */}
      <div className="grow min-h-[15%] flex flex-col border-l border-border bg-bg-secondary">
        {/* Browser Header */}
        <div className="h-9 flex items-center justify-between border-b border-border bg-bg-primary px-3 shrink-0 select-none">
          <div className="flex items-center gap-1.5 text-text-primary text-xs font-bold">
            <Globe size={13} className="text-text-secondary" />
            <span>Browser</span>
          </div>
          {hasActiveChallenge && !hideExpectedOption && (
            <button
              onClick={() => setShowExpectedPreview(!showExpectedPreview)}
              className={`px-2 py-[3px] text-[0.68rem] inline-flex items-center gap-1 border border-border rounded cursor-pointer ${
                showExpectedPreview ? "bg-accent/[0.08] text-accent" : "bg-transparent text-text-secondary"
              }`}
            >
              {showExpectedPreview ? <EyeOff size={12} /> : <Eye size={12} />}
              <span>{showExpectedPreview ? "Hide Expected" : "Expected Output"}</span>
            </button>
          )}
        </div>

        {/* Browser Viewport Area */}
        <div className={`grow flex min-h-0 p-2 relative ${showExpectedPreview ? "gap-2" : "gap-0"}`}>
          <div className="grow flex flex-col min-h-0 border border-border rounded-md overflow-hidden relative">
            <iframe
              srcDoc={srcDoc}
              title="Preview Output"
              className="preview-iframe"
              sandbox={iframeSandbox}
            />

            {isCompiling && (
              <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2.5">
                <RotateCw className="animate-spin" size={20} style={{ color: "var(--color-accent)" }} />
                <span className="text-[0.7rem] font-semibold">COMPILING...</span>
              </div>
            )}

            {/* reload button overlay */}
            <button
              onClick={onRefresh}
              className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-bg-secondary border border-border flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-text-secondary z-5 outline-none"
              title="Reload Preview"
            >
              <RotateCw size={12} />
            </button>
          </div>

          {showExpectedPreview && (
            <div className="grow flex flex-col min-h-0 border border-accent rounded-md overflow-hidden">
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 bg-accent-glow border-b border-accent select-none">
                <span className="text-accent font-semibold text-[0.7rem]">Reference Output</span>
              </div>
              <iframe srcDoc={expectedSrcDoc} title="Expected Output" className="w-full h-full border-none bg-white" sandbox={iframeSandbox} />
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Row Resizer Handle */}
      {onDragStart && (
        <div
          className="h-1.5 cursor-row-resize bg-transparent flex items-center justify-center z-10 shrink-0 select-none"
          onMouseDown={onDragStart}
        >
          <div className="h-0.5 w-9 rounded-sm bg-black/[0.08]" />
        </div>
      )}

      {/* Console Panel (Bottom) */}
      <div
        className="flex flex-col dev-console border-l border-t border-border !rounded-none overflow-hidden transition-[height] duration-200"
        style={{
          height: consoleCollapsed ? "36px" : `${consoleHeight}%`,
          minHeight: consoleCollapsed ? "36px" : "15%",
          flexShrink: consoleCollapsed ? 0 : undefined
        }}
      >
        {/* Console Header */}
        <div
          onClick={() => setConsoleCollapsed(c => !c)}
          className="h-9 flex items-center justify-between dev-console-header px-3 shrink-0 select-none cursor-pointer"
        >
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
            {consoleCollapsed ? <ChevronRight size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
            <Terminal size={13} className="text-accent animate-pulse" />
            <span>Console</span>
            {consoleLogs.length > 0 && (
              <span className="text-[0.65rem] bg-accent/10 border border-accent/20 rounded-xl px-1.5 py-0.5 text-accent font-sans font-bold">{consoleLogs.length}</span>
            )}
          </div>

          {!consoleCollapsed && (
            <div onClick={e => e.stopPropagation()} className="flex items-center gap-3">
              {/* Filter Pills */}
              <div className="flex gap-1.5 bg-slate-105 p-0.5 rounded-lg border border-slate-200">
                {[
                  { id: "all", label: "All", count: consoleLogs.length, activeClass: "active-all" },
                  { id: "log", label: "Logs", count: consoleLogs.filter(l => l.type === "log" || l.type === "info").length, activeClass: "active-log" },
                  { id: "error", label: "Errors", count: consoleLogs.filter(l => l.type === "error").length, activeClass: "active-error" }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setLogFilter(f.id)}
                    className={`px-2.5 py-1 text-[0.65rem] rounded-md cursor-pointer font-semibold dev-console-pill ${
                      logFilter === f.id ? f.activeClass : "text-slate-500 bg-transparent border-transparent"
                    }`}
                  >
                    {f.label} <span className="opacity-60 text-[0.6rem] ml-0.5">({f.count})</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setConsoleLogs([])}
                className="p-1 text-[0.68rem] inline-flex items-center justify-center bg-transparent border border-slate-200 hover:border-slate-350 hover:bg-slate-100 rounded-md text-slate-400 hover:text-rose-600 cursor-pointer transition-all duration-150"
                title="Clear Logs"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Console Logs Container */}
        {!consoleCollapsed && (
          <div className="grow overflow-y-auto px-4 py-3 dev-console-body">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-400 text-[0.7rem] italic text-center mt-4 flex flex-col items-center gap-1">
                <Terminal size={16} className="text-slate-300" />
                <span>Console empty</span>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const colors = { warn: "#b45309", error: "#dc2626", success: "#059669", log: "#0284c7" };
                const icons = {
                  warn: <AlertCircle size={11} className="text-amber-600" />,
                  error: <XCircle size={11} className="text-rose-600" />,
                  success: <CheckCircle2 size={11} className="text-emerald-600" />
                };
                const color = colors[log.type] || "#0f172a";
                const icon = icons[log.type] || <Info size={11} className="text-sky-600" />;
                const typeClass = log.type === "warn" ? "log-warn" : log.type === "error" ? "log-error" : log.type === "success" ? "log-success" : "log-info";

                let renderContent = <span className="whitespace-pre-wrap break-all select-text font-mono leading-relaxed text-[0.74rem] text-slate-800">{log.message}</span>;
                const trimmed = log.message.trim();
                if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
                  try {
                    renderContent = <JsonInspector data={JSON.parse(trimmed)} />;
                  } catch {
                    renderContent = <span className="whitespace-pre-wrap break-all select-text font-mono leading-relaxed text-[0.74rem] text-slate-800">{log.message}</span>;
                  }
                }

                return (
                  <div key={index} className={`dev-console-log-item ${typeClass} flex gap-2.5 items-start mb-1.5 pb-1 border-b border-slate-100`} style={{ color }}>
                    <span className="mt-0.5 shrink-0">{icon}</span>
                    <div className="grow">{renderContent}</div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;

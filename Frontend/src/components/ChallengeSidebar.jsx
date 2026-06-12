import { useEffect, useState } from "react";
import {
  BookOpen, CheckSquare, Check, XCircle, HelpCircle, FlaskConical
} from "lucide-react";
import { compileWebSandbox } from "../utils/compiler";


const formatTaskText = (text) => {
  if (!text) return "";
  const parts = text.split(/(`[^`]+`|"[^"]+")/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded font-mono text-[0.74rem] border border-gray-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('"') && part.endsWith('"')) {
      return (
        <code key={index} className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded font-mono text-[0.74rem] border border-gray-200">
          {part}
        </code>
      );
    }
    return part;
  });
};


const ChallengeSidebar = ({
  isDesktop,
  sidebarWidth,
  activeQuestion,
  validationResult,
  handleStepClick,
  isAuthorMode,
  visibleHints = {},
  toggleHint,
  handleNavPrev,
  handleNavNext,
  activeIndex = 0,
  totalQuestions = 1
}) => {
  const [activeTab, setActiveTab] = useState("problem");
  const [solutionLang, setSolutionLang] = useState("html");
  const [notes, setNotes] = useState(() => {
    return activeQuestion?.id ? localStorage.getItem(`ppa_notes_${activeQuestion.id}`) || "" : "";
  });

  useEffect(() => {
    queueMicrotask(() => {
      setNotes(activeQuestion?.id ? localStorage.getItem(`ppa_notes_${activeQuestion.id}`) || "" : "");
    });
  }, [activeQuestion?.id]);

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    if (activeQuestion?.id) {
      localStorage.setItem(`ppa_notes_${activeQuestion.id}`, val);
    }
  };

  if (!activeQuestion) {
    return (
      <div className="bg-white border-r border-gray-200 flex items-center justify-center p-6 text-gray-500" style={{ width: isDesktop ? `${sidebarWidth}%` : "100%" }}>
        <span>No active challenge selected</span>
      </div>
    );
  }

  const renderListOrText = (data, fallback) => {
    if (!data) return <p className="my-1">{fallback}</p>;
    return Array.isArray(data) ? (
      <ul className="pl-4 my-1 leading-relaxed">
        {data.map((item, idx) => <li key={idx}>{item}</li>)}
      </ul>
    ) : <p className="my-1">{data}</p>;
  };

  const totalSteps = activeQuestion.changesToBeDone?.length || 0;
  const passedStepsCount = activeQuestion.changesToBeDone
    ? activeQuestion.changesToBeDone.filter((_, idx) => {
        const stepResult = validationResult?.stepResults?.[idx];
        const hasRule = activeQuestion.rules?.some((r, rIdx) => (r.stepIndex ?? Math.min(rIdx, totalSteps - 1)) === idx);
        return hasRule ? stepResult?.success : validationResult?.success;
      }).length
    : 0;
  const progressPercent = totalSteps > 0 ? Math.round((passedStepsCount / totalSteps) * 100) : 0;

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full min-w-0 shrink-0 grow-0 font-[family-name:var(--font-family-ui)]">

      {/* Sidebar Top Nav Tabs */}
      <div className="h-9 border-b border-gray-200 bg-gray-50 flex items-center px-1.5 shrink-0 select-none">
        <div className="flex h-full gap-1">
          {[
            { id: "problem", label: "Problem", icon: <BookOpen size={13} /> },
            { id: "verification", label: "Submissions", icon: <CheckSquare size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`bg-transparent border-none cursor-pointer h-full flex items-center gap-1 px-2 text-[0.72rem] ${
                activeTab === tab.id
                  ? "text-accent font-bold border-b-2 border-b-accent"
                  : "text-gray-500 font-medium border-b-0"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prev / Next Question Navigation */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 bg-gray-50 shrink-0">
        <button
          onClick={handleNavPrev}
          disabled={activeIndex === 0}
          className={`px-3 py-1 text-[0.72rem] font-semibold rounded-[5px] border border-gray-200 flex items-center gap-1 ${
            activeIndex === 0 ? "cursor-not-allowed bg-gray-100 text-gray-400" : "cursor-pointer bg-white text-gray-700"
          }`}
        >
          ← Prev
        </button>
        <span className="text-[0.72rem] text-gray-500 font-semibold">
          {activeIndex + 1} / {totalQuestions}
        </span>
        <button
          onClick={handleNavNext}
          disabled={activeIndex === totalQuestions - 1}
          className={`px-3 py-1 text-[0.72rem] font-semibold rounded-[5px] border border-gray-200 flex items-center gap-1 ${
            activeIndex === totalQuestions - 1 ? "cursor-not-allowed bg-gray-100 text-gray-400" : "cursor-pointer bg-white text-gray-700"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grow overflow-y-auto p-5 flex flex-col text-gray-800 text-[0.85rem]">

        {activeTab === "problem" && (
          <div className="flex flex-col gap-[18px]">
            <div>
              {/* Title & Bookmark Row */}
              <div className="flex justify-center items-center mb-2">
                <h2 className="text-[1.3rem] font-bold text-gray-900 m-0">
                  {activeQuestion.title}
                </h2>
              </div>              
            </div>

            <div className="leading-relaxed text-gray-700">{activeQuestion.description}</div>

            {activeQuestion.changesToBeDone?.length > 0 && (
              <div>
                <h3 className="text-[0.82rem] font-bold text-gray-900 mb-3 uppercase tracking-wide">Tests:</h3>
                <div className="flex flex-col gap-2.5">
                  {activeQuestion.changesToBeDone.map((change, idx) => {
                    const stepResult = validationResult?.stepResults?.[idx];
                    const hasRule = activeQuestion.rules?.some(
                      (r, rIdx) => (r.stepIndex ?? Math.min(rIdx, totalSteps - 1)) === idx
                    );
                    const isPassed = hasRule ? stepResult?.success : validationResult?.success;
                    const isFailed = hasRule && stepResult && !stepResult.success;

                    let badgeBg = "bg-gray-100 border-gray-200 text-gray-500";
                    let itemBg = "bg-gray-50/50 border-gray-100";
                    let iconElement = <FlaskConical size={14} className="text-gray-500" />;

                    if (isPassed) {
                      badgeBg = "bg-emerald-50 border-emerald-200 text-emerald-600";
                      itemBg = "bg-emerald-50/10 border-emerald-100/70";
                      iconElement = <Check size={14} className="text-emerald-600" />;
                    } else if (isFailed) {
                      badgeBg = "bg-rose-50 border-rose-200 text-rose-600";
                      itemBg = "bg-rose-50/10 border-rose-100/70";
                      iconElement = <XCircle size={14} className="text-rose-600" />;
                    }

                    const cleanChange = change.replace(/^\d+\.\s*/, "");

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3.5 items-center px-4 py-3 rounded-xl border transition-all duration-150 ${itemBg}`}
                      >
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${badgeBg}`}>
                          {iconElement}
                        </div>
                        <div className="text-[0.78rem] text-gray-700 leading-relaxed font-semibold grow">
                          <span className="text-gray-900 mr-1">{idx + 1}.</span>
                          {formatTaskText(cleanChange)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeQuestion.solutionHtml !== undefined && (
              <div>
                <h3 className="text-[0.82rem] font-bold text-gray-900 mb-3 uppercase tracking-wide">Expected Output</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white h-[280px] relative">
                  <iframe
                    srcDoc={compileWebSandbox(
                      activeQuestion.solutionHtml || "",
                      activeQuestion.solutionCss || "",
                      activeQuestion.solutionJs || "",
                      "expected-sidebar"
                    )}
                    title="Expected Output Preview"
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "verification" && (
          <div className="flex flex-col min-h-0">
            <div className="flex flex-col gap-2 px-4 py-3 bg-gray-50 rounded-md border border-gray-200 mb-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-gray-600">REQUIRED TASKS VERIFICATION</span>
                <span style={{ color: progressPercent === 100 ? "#10b981" : "var(--color-accent)" }}>{passedStepsCount} / {totalSteps} Passed ({progressPercent}%)</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full transition-[width] duration-400 ease-in-out" style={{ width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? "#10b981" : "var(--color-accent)" }} />
              </div>
            </div>

            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {activeQuestion.changesToBeDone?.map((change, idx) => {
                const stepResult = validationResult?.stepResults?.[idx];
                const hasRule = activeQuestion.rules?.some((r, rIdx) => (r.stepIndex ?? Math.min(rIdx, totalSteps - 1)) === idx);
                const isPassed = hasRule ? stepResult?.success : validationResult?.success;

                const stepIcon = isPassed
                  ? <Check size={14} className="text-emerald-500" />
                  : (hasRule && stepResult)
                    ? <XCircle size={14} className="text-red-500" />
                    : <span className="text-gray-400 text-[0.85rem]">○</span>;

                const textColor = isPassed ? "text-gray-800" : (hasRule && stepResult) ? "text-red-500" : "text-gray-500";
                const itemBg = isPassed ? "bg-green-50" : (hasRule && stepResult) ? "bg-red-50" : "bg-transparent";
                const itemBorder = isPassed ? "border-green-100" : (hasRule && stepResult) ? "border-red-100" : "border-transparent";

                return (
                  <li
                    key={idx}
                    onClick={() => handleStepClick?.(idx)}
                    className={`flex flex-col gap-1 text-[0.78rem] leading-relaxed px-3 py-2.5 rounded-md border transition-all duration-150 ${textColor} ${itemBg} ${itemBorder} ${handleStepClick ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex gap-2.5 items-start">
                      <span className="flex items-center h-[18px] shrink-0">{stepIcon}</span>
                      <div className="grow">
                        <span className="font-medium">{change}</span>
                        {stepResult && !stepResult.success && stepResult.messages.length > 0 && (
                          <div className="text-[0.72rem] text-red-500 mt-1 font-medium">{stepResult.messages[0]}</div>
                        )}
                      </div>
                      {activeQuestion.hints?.[idx] && isAuthorMode && toggleHint && (
                        <button onClick={(e) => { e.stopPropagation(); toggleHint(idx); }} className={`bg-transparent border-none cursor-pointer flex opacity-75 ${visibleHints[idx] ? "text-accent" : "text-gray-500"}`}>
                          <HelpCircle size={14} />
                        </button>
                      )}
                    </div>
                    {visibleHints[idx] && activeQuestion.hints?.[idx] && isAuthorMode && (
                      <div onClick={(e) => e.stopPropagation()} className="mt-1.5 px-2.5 py-2 bg-gray-100 border-l-[3px] border-l-accent rounded text-[0.72rem] text-gray-800">
                        <span className="font-bold block text-accent">HINT:</span>{activeQuestion.hints[idx]}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeTab === "solution" && (
          <div className="flex flex-col">
            <div className="flex border-b border-gray-200 mb-3 gap-3">
              {[
                { id: "html", label: "index.html" },
                { id: "css", label: "style.css" },
                { id: "js", label: "index.js" }
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSolutionLang(lang.id)}
                  className={`bg-transparent border-none cursor-pointer text-xs px-0.5 py-1.5 ${
                    solutionLang === lang.id
                      ? "text-accent font-bold border-b-2 border-b-accent"
                      : "text-gray-500 font-medium border-b-0"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="bg-zinc-100 border border-zinc-200 rounded-md p-3 font-[family-name:var(--font-family-code)] text-[0.76rem] overflow-x-auto whitespace-pre-wrap text-gray-800 max-h-[400px]">
                {solutionLang === "html" ? activeQuestion.solutionHtml : solutionLang === "css" ? activeQuestion.solutionCss : activeQuestion.solutionJs}
              </pre>
              <button
                onClick={() => {
                  const txt = solutionLang === "html" ? activeQuestion.solutionHtml : solutionLang === "css" ? activeQuestion.solutionCss : activeQuestion.solutionJs;
                  navigator.clipboard.writeText(txt);
                  alert("Solution code copied to clipboard!");
                }}
                className="absolute top-2 right-2 px-2 py-1 text-[0.65rem] bg-white/80 border border-zinc-300 rounded cursor-pointer font-semibold"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="flex flex-col gap-3 h-full">
            <p className="text-xs text-gray-500 italic">
              Your notes are saved automatically to the browser's local storage.
            </p>
            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Write your notes or scratchpad items here..."
              className="w-full h-[280px] border border-slate-300 rounded-lg p-3 text-[0.8rem] font-[family-name:var(--font-family-ui)] outline-none resize-y leading-relaxed"
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default ChallengeSidebar;

import { useEffect } from "react";
import {
  Check, XCircle, HelpCircle
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
      <div className="grow overflow-y-auto p-5 flex flex-col text-gray-800 text-[0.85rem] gap-6">

        {/* Title & Description */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-center items-center">
            <h2 className="text-[1.25rem] font-bold text-gray-900 m-0 leading-tight">
              {activeQuestion.title}
            </h2>
          </div>
          <div className="leading-relaxed text-gray-600 text-[0.82rem]">{activeQuestion.description}</div>
        </div>

        {/* Expected Output Preview */}
        {activeQuestion.solutionHtml !== undefined && (
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-5">
            <h3 className="text-[0.8rem] font-bold text-gray-900 uppercase tracking-wider">Expected Output Preview</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white h-[260px] relative">
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

        {/* Verification Progress and Steps */}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5">
          <div className="flex flex-col gap-2 px-4 py-3 bg-slate-50/60 rounded-xl border border-slate-200/80 mb-1 select-none">
            <div className="flex justify-between items-center text-[0.7rem] font-bold tracking-wide text-slate-500">
              <span>TASKS VERIFICATION</span>
              <span className="font-bold text-[0.75rem]" style={{ color: progressPercent === 100 ? "#059669" : "var(--color-accent)" }}>
                {passedStepsCount} / {totalSteps} Passed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
              <div className="h-full transition-[width] duration-500 ease-in-out rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? "#059669" : "var(--color-accent)" }} />
            </div>
          </div>

          <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
            {activeQuestion.changesToBeDone?.map((change, idx) => {
              const stepResult = validationResult?.stepResults?.[idx];
              const hasRule = activeQuestion.rules?.some((r, rIdx) => (r.stepIndex ?? Math.min(rIdx, totalSteps - 1)) === idx);
              const isPassed = hasRule ? stepResult?.success : validationResult?.success;

              const stepIcon = isPassed
                ? <Check size={14} className="text-emerald-600" />
                : (hasRule && stepResult)
                  ? <XCircle size={14} className="text-rose-500" />
                  : <span className="text-slate-400 text-[0.8rem] font-bold">○</span>;

              const textColor = isPassed ? "text-gray-700" : (hasRule && stepResult) ? "text-red-600 font-medium" : "text-gray-500";
              const itemBg = isPassed
                ? "bg-emerald-50/10 border-emerald-100/70"
                : (hasRule && stepResult)
                  ? "bg-rose-50/10 border-rose-100/70"
                  : "bg-gray-50/30 border-gray-100";

              const cleanChange = change.replace(/^\d+\.\s*/, "");

              return (
                <li
                  key={idx}
                  onClick={() => handleStepClick?.(idx)}
                  className={`flex flex-col gap-1.5 text-[0.78rem] leading-relaxed px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer ${itemBg} ${textColor} hover:border-slate-300 hover:shadow-sm`}
                  title="Click to locate in code editor"
                >
                  <div className="flex gap-3.5 items-start">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-200 bg-white shrink-0 shadow-sm mt-0.5">{stepIcon}</span>
                    <div className="grow">
                      <span className="font-semibold text-gray-900 mr-1">{idx + 1}.</span>
                      <span className="text-gray-750">{formatTaskText(cleanChange)}</span>
                      {stepResult && !stepResult.success && stepResult.messages.length > 0 && (
                        <div className="text-[0.72rem] text-red-500 mt-1.5 font-medium bg-red-50/50 p-2.5 rounded-lg border border-red-100/50">{stepResult.messages[0]}</div>
                      )}
                    </div>
                    {activeQuestion.hints?.[idx] && isAuthorMode && toggleHint && (
                      <button onClick={(e) => { e.stopPropagation(); toggleHint(idx); }} className={`bg-transparent border-none cursor-pointer flex opacity-75 ${visibleHints[idx] ? "text-accent" : "text-gray-500"}`}>
                        <HelpCircle size={14} />
                      </button>
                    )}
                  </div>
                  {visibleHints[idx] && activeQuestion.hints?.[idx] && isAuthorMode && (
                    <div onClick={(e) => e.stopPropagation()} className="mt-2 px-3 py-2.5 bg-slate-50 border-l-[3px] border-l-accent rounded-lg text-[0.72rem] text-gray-800">
                      <span className="font-bold block text-accent mb-0.5">HINT:</span>{activeQuestion.hints[idx]}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ChallengeSidebar;

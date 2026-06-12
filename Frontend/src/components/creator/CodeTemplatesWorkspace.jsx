import { useState, useEffect } from "react";
import { FileText, Code2, Zap } from "lucide-react";
import Editor from "@monaco-editor/react";

const CodeTemplatesWorkspace = ({
  form,
  updateForm,
  tabSize,
  onAutoGenerate
}) => {
  const [hasBoilerplate, setHasBoilerplate] = useState(() => {
    return !!(form.html?.trim() || form.css?.trim() || form.js?.trim());
  });

  const [solTab, setSolTab] = useState("html");
  const [initTab, setInitTab] = useState("html");

  useEffect(() => {
    setHasBoilerplate(!!(form.html?.trim() || form.css?.trim() || form.js?.trim()));
  }, [form.id]);

  const getSolLanguage = () => {
    if (solTab === "html") return "html";
    if (solTab === "css") return "css";
    return "javascript";
  };

  const getInitLanguage = () => {
    if (initTab === "html") return "html";
    if (initTab === "css") return "css";
    return "javascript";
  };

  const initialCodeValue = initTab === "html" ? (form.html || "") : initTab === "css" ? (form.css || "") : (form.js || "");
  const solCodeValue = solTab === "html" ? (form.solHtml || "") : solTab === "css" ? (form.solCss || "") : (form.solJs || "");

  const handleInitialChange = (val) => {
    updateForm({ [initTab]: val });
  };

  const handleSolChange = (val) => {
    const solKey = `sol${solTab.charAt(0).toUpperCase() + solTab.slice(1)}`;
    updateForm({ [solKey]: val });
  };

  const handleToggleBoilerplate = (enable) => {
    setHasBoilerplate(enable);
    if (!enable) {
      updateForm({
        html: "",
        css: "",
        js: ""
      });
    }
  };

  return (
    <div className="creator-glass-card p-6 flex flex-col gap-5">
      <div className="flex justify-between items-center border-b border-border pb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-accent" />
          <span className="text-[0.85rem] font-bold text-text-primary">Starter & Solution Templates</span>
        </div>
      </div>

      {/* Option toggle row */}
      <div className="flex items-center justify-between py-1 border-b border-border shrink-0 select-none">
        <span className="text-[0.76rem] font-bold text-text-secondary">Provide Initial Boilerplate Template?</span>
        <div className="flex gap-1 bg-bg-tertiary p-0.5 rounded-lg border border-border">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" }
          ].map(opt => (
            <button 
              key={opt.label}
              type="button"
              onClick={() => handleToggleBoilerplate(opt.value)}
              className={`px-3 py-1 text-[0.68rem] font-bold border-none rounded-md cursor-pointer transition-all duration-150 ${
                hasBoilerplate === opt.value 
                  ? "text-text-primary bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04)]" 
                  : "text-text-secondary bg-transparent hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monaco Code Input Fields */}
      <div className={`grid ${hasBoilerplate ? "grid-cols-2" : "grid-cols-1"} gap-5 h-[380px] shrink-0`}>
        {/* Solution / Expected Output Editor */}
        <div className="flex flex-col gap-2 h-full min-w-0">
          <div className="flex justify-between items-center shrink-0 min-h-[32px]">
            <span className="text-[0.65rem] font-extrabold text-text-secondary tracking-wider uppercase flex items-center gap-1.5">
              <FileText size={12} className="text-accent" />
              <span>EXPECTED SOLUTION / OUTPUT</span>
            </span>
            <div className="flex gap-1 bg-bg-tertiary p-0.5 rounded-lg border border-border">
              {["html", "css", "js"].map(tab => (
                <button 
                  key={tab} 
                  type="button"
                  onClick={() => setSolTab(tab)} 
                  className={`px-2.5 py-1 text-[0.65rem] font-bold border-none rounded-md cursor-pointer transition-all duration-150 ${
                    solTab === tab 
                      ? "text-text-primary bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04)]" 
                      : "text-text-secondary bg-transparent hover:text-text-primary"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="grow border border-border rounded-xl overflow-hidden shadow-sm bg-white">
            <Editor 
              height="100%" 
              language={getSolLanguage()} 
              value={solCodeValue} 
              onChange={handleSolChange} 
              theme="vs"
              options={{ 
                fontSize: 12, 
                minimap: { enabled: false }, 
                tabSize,
                fontFamily: "var(--font-family-code)",
                lineNumbersMinChars: 3,
                padding: { top: 8, bottom: 8 }
              }} 
            />
          </div>
        </div>

        {/* Initial Boilerplate Editor */}
        {hasBoilerplate && (
          <div className="flex flex-col gap-2 h-full min-w-0">
            <div className="flex justify-between items-center shrink-0 min-h-[32px]">
              <span className="text-[0.65rem] font-extrabold text-text-secondary tracking-wider uppercase flex items-center gap-1.5">
                <FileText size={12} />
                <span>INITIAL BOILERPLATE</span>
              </span>
              <div className="flex gap-1 bg-bg-tertiary p-0.5 rounded-lg border border-border">
                {["html", "css", "js"].map(tab => (
                  <button 
                    key={tab} 
                    type="button"
                    onClick={() => setInitTab(tab)} 
                    className={`px-2.5 py-1 text-[0.65rem] font-bold border-none rounded-md cursor-pointer transition-all duration-150 ${
                      initTab === tab 
                        ? "text-text-primary bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04)]" 
                        : "text-text-secondary bg-transparent hover:text-text-primary"
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="grow border border-border rounded-xl overflow-hidden shadow-sm bg-white">
              <Editor 
                height="100%" 
                language={getInitLanguage()} 
                value={initialCodeValue} 
                onChange={handleInitialChange} 
                theme="vs"
                options={{ 
                  fontSize: 12, 
                  minimap: { enabled: false }, 
                  tabSize,
                  fontFamily: "var(--font-family-code)",
                  lineNumbersMinChars: 3,
                  padding: { top: 8, bottom: 8 }
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Auto generator Banner */}
      <div className="flex gap-3 items-center bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 shrink-0">
        <button 
          type="button"
          onClick={onAutoGenerate} 
          className="btn-minimal border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 px-3.5 py-2 rounded-lg text-[0.72rem] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0 shadow-sm"
        >
          <Zap size={13} className="fill-emerald-700" /> 
          <span>Auto-Draft Boilerplates</span>
        </button>
        <span className="text-[0.7rem] text-text-secondary font-semibold leading-relaxed">
          Generates default starter template and sample solution DOM nodes automatically matching your defined Checkpoint ID and Element rules.
        </span>
      </div>
    </div>
  );
};

export default CodeTemplatesWorkspace;

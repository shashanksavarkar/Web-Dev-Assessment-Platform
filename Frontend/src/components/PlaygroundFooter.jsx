import { Play, Send } from "lucide-react";

const PlaygroundFooter = ({
  onRunCode,
  onSubmitPractice
}) => {
  return (
    <footer className="h-10 bg-white border-t border-l border-border flex items-center justify-end px-4 font-[family-name:var(--font-family-ui)] text-text-primary shrink-0 select-none z-100">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onRunCode}
          className="h-7 px-3.5 rounded bg-orange-600 border-none text-white text-[0.72rem] font-bold cursor-pointer flex items-center gap-1.5"
          title="Run (Ctrl+Enter)"
        >
          <Play size={11} fill="#ffffff" /><span>Run</span>
        </button>
        <button
          onClick={onSubmitPractice}
          className="h-7 px-3.5 rounded bg-blue-600 border-none text-white text-[0.72rem] font-bold cursor-pointer flex items-center gap-1.5"
          title="Submit"
        >
          <Send size={11} style={{ transform: "rotate(-45deg)" }} /><span>Submit</span>
        </button>
      </div>
    </footer>
  );
};

export default PlaygroundFooter;

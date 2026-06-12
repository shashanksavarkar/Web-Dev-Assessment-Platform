import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import CreatorWorkspace from "../components/CreatorWorkspace";
import DEFAULT_QUESTIONS from "../constants/challenges.json";
import { getChallenges } from "../utils/pb";

const CreatorPage = () => {
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem("ppa_custom_challenges");
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  useEffect(() => {
    const load = async () => {
      const data = await getChallenges();
      setQuestions(data);
    };
    load();
  }, []);

  const [toasts, setToasts] = useState([]);
  const [tabSize] = useState(() => {
    try {
      return parseInt(localStorage.getItem("ppa_setting_tabsize") || "2", 10);
    } catch {
      return 2;
    }
  });

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* Spacious Creator Workspace Dashboard */}
      <main className="grow overflow-hidden flex flex-col min-h-0 pt-6">
        <CreatorWorkspace
          questions={questions}
          setQuestions={setQuestions}
          showToast={showToast}
          tabSize={tabSize}
        />
      </main>

      {/* Toast System */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item toast-${toast.type || "info"} shadow-lg rounded-xl`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatorPage;

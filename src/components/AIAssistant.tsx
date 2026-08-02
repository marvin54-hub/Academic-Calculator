import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, X, Send, BookOpen, GraduationCap, ChevronRight, HelpCircle } from "lucide-react";
import { Module, ProfileSettings } from "../types";

interface AIAssistantProps {
  modules: Module[];
  settings: ProfileSettings;
  themeColor: string;
}

interface Message {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: Date;
}

export default function AIAssistant({ modules, settings, themeColor }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "assistant",
      text: `Hi ${settings.name || "there"}! I am your AI Academic Assistant. 📚✨

I'm loaded with your current modules and grades. Ask me anything like:
• "What marks do I need in CS101 to pass?"
• "Can I still get a distinction in MATH201?"
• "How can I improve my grades overall?"
• "Explain how GPA is calculated here."

How can I help you plan your academic success today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const predefinedPrompts = [
    { label: "What mark do I need to pass?", query: "Look at my current modules. What marks do I need to pass each one?" },
    { label: "Can I still get a distinction?", query: "Based on my current completed assessments, can I still get distinction in my subjects? Explain mathematically." },
    { label: "How can I improve?", query: "Suggest study habits and goal setting tips to help me boost my overall average." },
    { label: "Explain GPA / CGPA", query: "Can you explain how GPA and CGPA work, and what mine are currently?" },
    { label: "Help me plan", query: "Create a study planner outline for my upcoming assignments and exams." },
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: "u-" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Gather relevant data to context-enrich our prompt
      const context = {
        studentName: settings.name,
        institution: settings.institution,
        course: settings.course,
        targetGpa: settings.goalGpa,
        streak: settings.streak,
        subjects: modules.map((m) => {
          // Calculate completed weight and average
          const graded = m.assessments.filter((a) => a.status === "graded");
          let totalWeight = 0;
          let earned = 0;
          graded.forEach((g) => {
            if (g.obtainedMark !== null) {
              totalWeight += g.weight;
              earned += (g.obtainedMark / g.maxMark) * g.weight;
            }
          });
          const currentAvg = totalWeight > 0 ? (earned / totalWeight) * 100 : 0;
          const pending = m.assessments.filter((a) => a.status === "pending").map((p) => ({
            name: p.name,
            weight: p.weight,
            date: p.date,
          }));

          return {
            name: m.name,
            code: m.code,
            credits: m.credits,
            passMark: m.passMark,
            distinctionMark: m.distinctionMark,
            examWeight: m.examWeight,
            currentAverage: Math.round(currentAvg * 10) / 10,
            completedWeight: totalWeight,
            pendingAssessments: pending,
          };
        }),
      };

      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = new Error(data.error || "Failed to contact academic server.") as Error & {
          isConfigMissing?: boolean;
        };
        err.isConfigMissing = Boolean(data.isConfigMissing);
        throw err;
      }

      const botMsg: Message = {
        id: "b-" + Math.random().toString(36).substr(2, 9),
        sender: "assistant",
        text: data.text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: "err-" + Math.random().toString(36).substr(2, 9),
        sender: "system",
        text: err.isConfigMissing
          ? "I noticed your Gemini API Key is missing or invalid. Please set GEMINI_API_KEY in your .env.local file (get a key at https://aistudio.google.com/apikey), then restart the server."
          : "Oops! I had trouble reaching my academic database. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer hover:shadow-primary/40 border border-white/10"
        style={{
          backgroundImage: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})`,
        }}
        id="ai-assistant-fab"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </motion.button>

      {/* Main Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/20 backdrop-blur-xs pointer-events-auto">
            {/* Click outside backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-md h-full bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-2xl relative z-10 font-sans"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: themeColor }} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm">Academic Assistant</h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message Log */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {messages.map((msg) => {
                  if (msg.sender === "system") {
                    return (
                      <div key={msg.id} className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-xs text-red-700 font-medium leading-relaxed shadow-xs">
                        {msg.text}
                      </div>
                    );
                  }

                  const isUser = msg.sender === "user";
                  return (
                    <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] p-4 rounded-3xl text-xs leading-relaxed shadow-xs ${
                          isUser
                            ? "bg-slate-850 text-white rounded-br-none"
                            : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                        }`}
                      >
                        {/* Render simple list elements cleanly */}
                        <div className="whitespace-pre-wrap font-medium">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl rounded-bl-none shadow-xs flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColor, animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Predefined Prompt Chips */}
              {messages.length === 1 && (
                <div className="px-6 py-3 overflow-x-auto flex space-x-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  {predefinedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      className="shrink-0 text-[10px] font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200/50 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Box */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Ask me a question..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                />
                <button
                  onClick={() => handleSend(inputText)}
                  disabled={!inputText.trim() || loading}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shadow-md hover:shadow-lg transition cursor-pointer shrink-0"
                  style={{ backgroundColor: themeColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

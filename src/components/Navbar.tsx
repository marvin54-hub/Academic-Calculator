import { Home, Calculator, BookOpen, History, User } from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "calculate" | "subjects" | "history" | "profile";
  setActiveTab: (tab: "home" | "calculate" | "subjects" | "history" | "profile") => void;
  themeColor: string;
}

export default function Navbar({ activeTab, setActiveTab, themeColor }: NavbarProps) {
  const tabs = [
    { id: "home" as const, label: "Home", icon: Home },
    { id: "calculate" as const, label: "Calculate", icon: Calculator },
    { id: "subjects" as const, label: "Subjects", icon: BookOpen },
    { id: "history" as const, label: "History", icon: History },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 px-4 pb-safe-bottom shadow-md">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex justify-between py-2.5">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center flex-1 py-1 relative focus:outline-none transition group cursor-pointer"
            >
              {/* Highlight background pill (Material 3 standard) */}
              <div
                className="h-8 w-14 rounded-full flex items-center justify-center mb-1 transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: isActive ? `${themeColor}15` : "transparent",
                }}
              >
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                  style={{
                    color: isActive ? themeColor : "#64748b",
                    strokeWidth: isActive ? 2.5 : 2,
                  }}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${isActive ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}
              >
                {tab.label}
              </span>

              {/* Dot indicator */}
              {isActive && (
                <div
                  className="absolute bottom-0 w-1 h-1 rounded-full animate-pulse"
                  style={{ backgroundColor: themeColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

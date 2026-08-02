import { useAcademicState } from "./hooks/useAcademicState";
import SplashAndOnboarding from "./components/SplashAndOnboarding";
import LoginScreen from "./components/LoginScreen";
import Navbar from "./components/Navbar";
import HomeScreen from "./components/HomeScreen";
import CalculatorDeck from "./components/CalculatorDeck";
import ModuleList from "./components/ModuleList";
import AssessmentList from "./components/AssessmentList";
import HistoryLog from "./components/HistoryLog";
import ProfilePanel from "./components/ProfilePanel";
import AIAssistant from "./components/AIAssistant";
import SettingsModal from "./components/SettingsModal";
import { useState } from "react";
import { GraduationCap, Award, Settings as SettingsIcon } from "lucide-react";

export default function App() {
  const {
    activeTab,
    setActiveTab,
    modules,
    addModule,
    updateModule,
    deleteModule,
    duplicateModule,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    history,
    addHistory,
    deleteHistory,
    clearHistory,
    settings,
    updateSettings,
    user,
    loginWithAccount,
    loginAsGuest,
    logoutUser,
    deleteAccount,
    selectedModuleId,
    setSelectedModuleId,
    onboarded,
    completeOnboarding,
    checkingSession,
    importData,
  } = useAcademicState();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const primaryColor = settings.themeColor;

  // Onboarding Screen
  if (!onboarded) {
    return <SplashAndOnboarding onComplete={completeOnboarding} themeColor={primaryColor} />;
  }

  // Waiting to find out if there's already a valid session before deciding
  // whether to show the login screen.
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div
          className="w-8 h-8 rounded-full border-2 border-slate-700 animate-spin"
          style={{ borderTopColor: primaryColor }}
        />
      </div>
    );
  }

  // Authentication Screen
  if (!user.isLoggedIn) {
    return <LoginScreen onLogin={loginWithAccount} onGuest={loginAsGuest} themeColor={primaryColor} />;
  }

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Decorative ambient background blur lights */}
      <div
        className="absolute w-96 h-96 rounded-full filter blur-[120px] opacity-[0.03] dark:opacity-[0.06] -top-20 -left-20 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute w-80 h-80 rounded-full filter blur-[140px] opacity-[0.02] dark:opacity-[0.05] bottom-20 right-0 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Main Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4 shadow-xs">
        <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white font-black shadow-md border border-white/5"
              style={{
                backgroundImage: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor})`,
              }}
            >
              <GraduationCap className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider text-slate-800 dark:text-slate-100 block uppercase leading-none">
                Academic Calculator
              </span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-1 block">
                {settings.institution || "Personal Workspace"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/55 dark:border-slate-700/55">
              <Award className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{settings.streak} 🔥</span>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/55 dark:border-slate-700/55 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        user={user}
        onUpdateSettings={updateSettings}
        onDeleteAccount={deleteAccount}
        onLogout={logoutUser}
        themeColor={primaryColor}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-6 pt-6 pb-28 relative">
        {selectedModule ? (
          <AssessmentList
            module={selectedModule}
            onBack={() => setSelectedModuleId(null)}
            onAddAssessment={addAssessment}
            onUpdateAssessment={updateAssessment}
            onDeleteAssessment={deleteAssessment}
            themeColor={primaryColor}
          />
        ) : (
          <>
            {activeTab === "home" && (
              <HomeScreen
                modules={modules}
                settings={settings}
                onNavigate={(tab) => {
                  setSelectedModuleId(null);
                  setActiveTab(tab);
                }}
                themeColor={primaryColor}
              />
            )}

            {activeTab === "calculate" && (
              <CalculatorDeck onAddHistory={addHistory} themeColor={primaryColor} />
            )}

            {activeTab === "subjects" && (
              <ModuleList
                modules={modules}
                onSelectModule={setSelectedModuleId}
                onAddModule={addModule}
                onUpdateModule={updateModule}
                onDeleteModule={deleteModule}
                onDuplicateModule={duplicateModule}
                themeColor={primaryColor}
              />
            )}

            {activeTab === "history" && (
              <HistoryLog
                history={history}
                onDeleteEntry={deleteHistory}
                onClearHistory={clearHistory}
                themeColor={primaryColor}
              />
            )}

            {activeTab === "profile" && (
              <ProfilePanel
                settings={settings}
                user={user}
                modules={modules}
                history={history}
                onUpdateSettings={updateSettings}
                onImportData={importData}
                onLogout={logoutUser}
                themeColor={primaryColor}
              />
            )}
          </>
        )}
      </main>

      {/* Floating AI Assistant overlay chat bubble */}
      <AIAssistant modules={modules} settings={settings} themeColor={primaryColor} />

      {/* Material 3 Bottom Nav */}
      <Navbar activeTab={activeTab} setActiveTab={(tab) => {
        setSelectedModuleId(null);
        setActiveTab(tab);
      }} themeColor={primaryColor} />
    </div>
  );
}

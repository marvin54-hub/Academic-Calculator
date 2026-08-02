import React, { useState, useRef } from "react";
import {
  User,
  GraduationCap,
  Sparkles,
  Settings,
  Moon,
  Sun,
  Palette,
  Award,
  Download,
  Upload,
  LogOut,
  Bell,
  Sliders,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Module, HistoryEntry, ProfileSettings, UserSession } from "../types";

interface ProfilePanelProps {
  settings: ProfileSettings;
  user: UserSession;
  modules: Module[];
  history: HistoryEntry[];
  onUpdateSettings: (settings: Partial<ProfileSettings>) => void;
  onImportData: (data: { modules?: Module[]; history?: HistoryEntry[]; settings?: ProfileSettings }) => void;
  onLogout: () => void;
  themeColor: string;
}

export default function ProfilePanel({
  settings,
  user,
  modules,
  history,
  onUpdateSettings,
  onImportData,
  onLogout,
  themeColor,
}: ProfilePanelProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const colors = [
    { name: "Royal Blue", hex: "#2563EB" },
    { name: "Emerald Green", hex: "#10B981" },
    { name: "Rose Red", hex: "#F43F5E" },
    { name: "Amber Yellow", hex: "#F59E0B" },
    { name: "Deep Purple", hex: "#8B5CF6" },
    { name: "Slate Black", hex: "#475569" },
  ];

  const handleBackup = () => {
    try {
      const data = { modules, history, settings };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `academic_calculator_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setSuccess("Backup JSON file generated and downloaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onImportData({
          modules: Array.isArray(data.modules) ? data.modules : undefined,
          history: Array.isArray(data.history) ? data.history : undefined,
          settings: data.settings && typeof data.settings === "object" ? data.settings : undefined,
        });
        setSuccess(
          user.isAnonymous
            ? "Backup restored to this device."
            : "Backup restored and synced to your account."
        );
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        alert("Invalid backup file format. Please upload a valid .json backup.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Header Profile Badge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.2rem] flex flex-col md:flex-row md:items-center md:space-x-4 shadow-xs">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-0 shadow-lg font-serif italic font-bold text-xl shrink-0 border border-white/10"
          style={{
            backgroundImage: `linear-gradient(135deg, ${themeColor}cc, ${themeColor})`,
          }}
        >
          {settings.name ? settings.name.charAt(0).toUpperCase() : "?"}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-serif font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <span>{settings.name || "Student"}</span>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200/50 tracking-wider">
              {user.isAnonymous ? "GUEST" : "SIGNED IN"}
            </span>
          </h2>
          {settings.course || settings.institution ? (
            <>
              {settings.course && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{settings.course}</p>
              )}
              {settings.institution && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {settings.institution}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Add your course and institution below
            </p>
          )}
        </div>
      </div>

      {!settings.institution && !settings.course && (
        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2.5">
          <User className="w-4 h-4 shrink-0 mt-0.5" style={{ color: themeColor }} />
          <span>
            Your profile is empty. Fill in your name, institution, and course below so the app can
            personalize your experience.
          </span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 text-center font-medium flex items-center justify-center space-x-2 animate-pulse">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Editing Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.2rem] space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2">
          <User className="w-4 h-4" style={{ color: themeColor }} />
          <span>STUDENT DETAILS</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Name</label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => onUpdateSettings({ name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Academic Year</label>
            <input
              type="text"
              placeholder="e.g. Year 1"
              value={settings.year}
              onChange={(e) => onUpdateSettings({ year: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">University/Institution</label>
          <input
            type="text"
            value={settings.institution}
            onChange={(e) => onUpdateSettings({ institution: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Course / Degree</label>
            <input
              type="text"
              value={settings.course}
              onChange={(e) => onUpdateSettings({ course: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Department / Faculty</label>
            <input
              type="text"
              value={settings.faculty}
              onChange={(e) => onUpdateSettings({ faculty: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
            />
          </div>
        </div>
      </div>

      {/* Theme and Preferences Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.2rem] space-y-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2">
          <Settings className="w-4 h-4" style={{ color: themeColor }} />
          <span>PREFERENCES & STYLE</span>
        </h3>

        {/* Theme select buttons */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Theme Mode</label>
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {(["light", "dark", "system"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onUpdateSettings({ theme: m })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition capitalize flex items-center justify-center space-x-1 cursor-pointer ${
                  settings.theme === m
                    ? "bg-white text-slate-800 border border-slate-200/40 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {m === "light" && <Sun className="w-3.5 h-3.5" />}
                {m === "dark" && <Moon className="w-3.5 h-3.5" />}
                {m === "system" && <Settings className="w-3.5 h-3.5" />}
                <span>{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5" />
            <span>PRIMARY THEME COLOR</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => onUpdateSettings({ themeColor: c.hex })}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200/40 dark:border-slate-700/40 active:scale-90 transition cursor-pointer relative"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {settings.themeColor === c.hex && (
                  <div className="w-2.5 h-2.5 bg-white dark:bg-slate-900 rounded-full shadow-inner animate-scale-up" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Grading System */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Award className="w-3.5 h-3.5" />
              <span>Grading Scale</span>
            </label>
            <select
              value={settings.defaultGradingSystem}
              onChange={(e) => onUpdateSettings({ defaultGradingSystem: e.target.value as any })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
            >
              <option value="ZA">South Africa (%)</option>
              <option value="US">USA GPA (A/B/C/D)</option>
              <option value="UK">UK Classification</option>
              <option value="custom">Custom Scale</option>
            </select>
          </div>

          {/* Precision setting */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Precision</span>
            </label>
            <select
              value={settings.precision}
              onChange={(e) => onUpdateSettings({ precision: Number(e.target.value) })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
            >
              <option value={0}>0 decimal places</option>
              <option value={1}>1 decimal place</option>
              <option value={2}>2 decimal places</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup and Recovery Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.2rem] space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2">
          <Download className="w-4 h-4" style={{ color: themeColor }} />
          <span>EXPORT & IMPORT DATA</span>
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleBackup}
            className="py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 active:scale-[0.98] flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Generate Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-3 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 active:scale-[0.98] flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            <span>Restore Backup</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleRestore}
          accept=".json"
          className="hidden"
        />

        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold text-center leading-relaxed max-w-xs mx-auto">
          {user.isAnonymous
            ? "Guest data lives only on this device. Download a .json file to move it to another device or back it up."
            : "Your data is already saved to your account automatically. Use export/import to move a copy between accounts or keep an offline copy."}
        </p>
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="w-full py-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100/60 border border-red-100 dark:border-red-500/20 rounded-[2rem] font-bold text-xs text-red-600 flex items-center justify-center space-x-2 transition active:scale-[0.99] cursor-pointer shadow-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out Account</span>
      </button>
    </div>
  );
}

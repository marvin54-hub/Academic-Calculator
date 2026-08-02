import { useState, useEffect, useRef } from "react";
import { localDB } from "../services/db";
import { api, ApiUser } from "../services/api";
import { Module, Assessment, HistoryEntry, ProfileSettings, UserSession } from "../types";

const DEFAULT_SETTINGS: ProfileSettings = {
  name: "",
  institution: "",
  course: "",
  faculty: "",
  year: "",
  theme: "system",
  themeColor: "#2563EB",
  defaultGradingSystem: "ZA",
  precision: 1,
  notificationsEnabled: true,
  streak: 0,
  goalGpa: 3.5,
  customGrades: [
    { grade: "A+", minPercentage: 90, gpaPoint: 4.0 },
    { grade: "A", minPercentage: 80, gpaPoint: 4.0 },
    { grade: "B", minPercentage: 70, gpaPoint: 3.0 },
    { grade: "C", minPercentage: 60, gpaPoint: 2.0 },
    { grade: "D", minPercentage: 50, gpaPoint: 1.0 },
    { grade: "F", minPercentage: 0, gpaPoint: 0.0 },
  ],
};

const EMPTY_USER: UserSession = {
  uid: "",
  email: null,
  displayName: null,
  isAnonymous: true,
  isLoggedIn: false,
};

export function useAcademicState() {
  const [activeTab, setActiveTab] = useState<"home" | "calculate" | "subjects" | "history" | "profile">("home");
  const [modules, setModules] = useState<Module[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_SETTINGS);
  const [user, setUser] = useState<UserSession>(EMPTY_USER);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("academic_calculator_onboarded") === "true";
  });

  // True once initial data has loaded, so we don't overwrite server data
  // with empty state on first render before the fetch resolves.
  const dataLoadedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check for an existing server session (real account). If there
  // isn't one, fall back to whatever is in local storage (guest mode).
  useEffect(() => {
    (async () => {
      try {
        const { user: apiUser } = await api.me();
        await hydrateFromAccount(apiUser);
      } catch {
        setModules(localDB.getModules());
        setHistory(localDB.getHistory());
        setSettings(localDB.getSettings());
        setUser(localDB.getUser());
        dataLoadedRef.current = true;
      } finally {
        setCheckingSession(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update theme on settings change
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      settings.theme === "dark" ||
      (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.style.setProperty("--primary-theme-color", settings.themeColor);
  }, [settings.theme, settings.themeColor]);

  // Debounced sync to the server for real (non-guest) accounts whenever
  // data changes.
  useEffect(() => {
    if (!dataLoadedRef.current) return;
    if (!user.isLoggedIn || user.isAnonymous) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.saveData(modules, history, settings).catch(() => {
        // Best-effort sync; data still lives in component state locally.
      });
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, history, settings, user.isLoggedIn, user.isAnonymous]);

  async function hydrateFromAccount(apiUser: ApiUser, isNewAccount = false) {
    setUser({
      uid: apiUser.uid,
      email: apiUser.email,
      displayName: apiUser.displayName,
      isAnonymous: false,
      isLoggedIn: true,
    });

    try {
      const remote = await api.getData();
      setModules(remote.modules ?? []);
      setHistory(remote.history ?? []);
      setSettings(remote.settings ?? { ...DEFAULT_SETTINGS, name: apiUser.displayName });
      if (isNewAccount) {
        setActiveTab("profile");
      }
    } finally {
      dataLoadedRef.current = true;
    }
  }

  const saveModules = (updatedModules: Module[]) => {
    setModules(updatedModules);
    if (user.isAnonymous || !user.isLoggedIn) localDB.saveModules(updatedModules);
  };

  const addModule = (newModule: Omit<Module, "id">) => {
    const module: Module = {
      ...newModule,
      id: "m-" + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...modules, module];
    saveModules(updated);
    return module;
  };

  const updateModule = (id: string, updatedFields: Partial<Module>) => {
    const updated = modules.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
    saveModules(updated);
  };

  const deleteModule = (id: string) => {
    const updated = modules.filter((m) => m.id !== id);
    saveModules(updated);
    if (selectedModuleId === id) {
      setSelectedModuleId(null);
    }
  };

  const duplicateModule = (id: string) => {
    const moduleToCopy = modules.find((m) => m.id === id);
    if (moduleToCopy) {
      const copy: Module = {
        ...moduleToCopy,
        id: "m-" + Math.random().toString(36).substr(2, 9),
        name: `${moduleToCopy.name} (Copy)`,
        assessments: moduleToCopy.assessments.map((a) => ({
          ...a,
          id: "a-" + Math.random().toString(36).substr(2, 9),
        })),
      };
      saveModules([...modules, copy]);
    }
  };

  const addAssessment = (moduleId: string, assessment: Omit<Assessment, "id">) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: "a-" + Math.random().toString(36).substr(2, 9),
    };
    const updated = modules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, assessments: [...m.assessments, newAssessment] };
      }
      return m;
    });
    saveModules(updated);
  };

  const updateAssessment = (moduleId: string, assessmentId: string, updatedFields: Partial<Assessment>) => {
    const updated = modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          assessments: m.assessments.map((a) => (a.id === assessmentId ? { ...a, ...updatedFields } : a)),
        };
      }
      return m;
    });
    saveModules(updated);
  };

  const deleteAssessment = (moduleId: string, assessmentId: string) => {
    const updated = modules.map((m) => {
      if (m.id === moduleId) {
        return { ...m, assessments: m.assessments.filter((a) => a.id !== assessmentId) };
      }
      return m;
    });
    saveModules(updated);
  };

  const addHistory = (calculatorName: string, inputs: Record<string, string | number>, result: string) => {
    const entry: HistoryEntry = {
      id: "h-" + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      calculatorName,
      inputs,
      result,
    };
    const updated = [entry, ...history];
    setHistory(updated);
    if (user.isAnonymous || !user.isLoggedIn) localDB.saveHistory(updated);
    return entry;
  };

  const deleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    if (user.isAnonymous || !user.isLoggedIn) localDB.saveHistory(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    if (user.isAnonymous || !user.isLoggedIn) localDB.saveHistory([]);
  };

  const updateSettings = (updatedFields: Partial<ProfileSettings>) => {
    const updated = { ...settings, ...updatedFields };
    setSettings(updated);
    if (user.isAnonymous || !user.isLoggedIn) localDB.saveSettings(updated);
  };

  // Called after a real sign-up or sign-in against the backend.
  const loginWithAccount = async (apiUser: ApiUser, isNewAccount = false) => {
    await hydrateFromAccount(apiUser, isNewAccount);
  };

  // Guest mode: local-only, no account is created.
  const loginAsGuest = () => {
    const session: UserSession = {
      uid: "guest-" + Math.random().toString(36).substr(2, 9),
      email: null,
      displayName: "Guest Student",
      isAnonymous: true,
      isLoggedIn: true,
    };
    setUser(session);
    localDB.saveUser(session);
    setModules(localDB.getModules());
    setHistory(localDB.getHistory());
    setSettings(localDB.getSettings());
    dataLoadedRef.current = true;
  };

  const logoutUser = async () => {
    if (!user.isAnonymous) {
      try {
        await api.logout();
      } catch {
        // Ignore network errors on logout; clear local state regardless.
      }
    } else {
      localDB.logout();
    }
    dataLoadedRef.current = false;
    setUser(EMPTY_USER);
    setModules([]);
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveTab("home");
  };

  // Permanently deletes the account and all of its saved data server-side.
  const deleteAccount = async (password: string) => {
    await api.deleteAccount(password);
    dataLoadedRef.current = false;
    setUser(EMPTY_USER);
    setModules([]);
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveTab("home");
  };

  // Used by the JSON export/import feature. Applies restored data to live
  // state (and, for real accounts, lets the existing sync effect push it
  // to the server) instead of writing straight to localStorage.
  const importData = (data: { modules?: Module[]; history?: HistoryEntry[]; settings?: ProfileSettings }) => {
    if (data.modules) saveModules(data.modules);
    if (data.history) {
      setHistory(data.history);
      if (user.isAnonymous || !user.isLoggedIn) localDB.saveHistory(data.history);
    }
    if (data.settings) updateSettings(data.settings);
  };

  const completeOnboarding = () => {
    localStorage.setItem("academic_calculator_onboarded", "true");
    setOnboarded(true);
  };

  return {
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
  };
}
export type AcademicState = ReturnType<typeof useAcademicState>;

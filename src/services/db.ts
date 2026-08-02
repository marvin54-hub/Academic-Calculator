import { Module, Assessment, HistoryEntry, ProfileSettings, UserSession } from "../types";

const MODULES_KEY = "academic_calculator_modules";
const HISTORY_KEY = "academic_calculator_history";
const SETTINGS_KEY = "academic_calculator_settings";
const USER_KEY = "academic_calculator_user";

const defaultModules: Module[] = [
  {
    id: "m-1",
    name: "Introduction to Computer Science",
    code: "CS101",
    credits: 6,
    lecturer: "Dr. Alice Smith",
    semester: "Semester 1",
    year: "Year 1",
    passMark: 50,
    distinctionMark: 75,
    examWeight: 40,
    assessments: [
      {
        id: "a-1-1",
        name: "Programming Basics Assignment",
        weight: 10,
        obtainedMark: 85,
        maxMark: 100,
        date: "2026-06-15",
        status: "graded",
        type: "Assignment",
      },
      {
        id: "a-1-2",
        name: "Data Structures Practical",
        weight: 15,
        obtainedMark: 78,
        maxMark: 100,
        date: "2026-07-02",
        status: "graded",
        type: "Practical",
      },
      {
        id: "a-1-3",
        name: "Midterm Coding Exam",
        weight: 25,
        obtainedMark: 82,
        maxMark: 100,
        date: "2026-07-10",
        status: "graded",
        type: "Test",
      },
      {
        id: "a-1-4",
        name: "Project: Automated Grade System",
        weight: 10,
        obtainedMark: 90,
        maxMark: 100,
        date: "2026-07-15",
        status: "graded",
        type: "Project",
      },
      {
        id: "a-1-5",
        name: "Final Comprehensive Exam",
        weight: 40,
        obtainedMark: null,
        maxMark: 100,
        date: "2026-08-10",
        status: "pending",
        type: "Exam",
      },
    ],
  },
  {
    id: "m-2",
    name: "Linear Algebra & Calculus",
    code: "MATH201",
    credits: 8,
    lecturer: "Prof. Robert Johnson",
    semester: "Semester 1",
    year: "Year 1",
    passMark: 50,
    distinctionMark: 75,
    examWeight: 50,
    assessments: [
      {
        id: "a-2-1",
        name: "Matrix Algebra Quiz",
        weight: 10,
        obtainedMark: 90,
        maxMark: 100,
        date: "2026-06-18",
        status: "graded",
        type: "Quiz",
      },
      {
        id: "a-2-2",
        name: "Vector Spaces Quiz",
        weight: 10,
        obtainedMark: 55,
        maxMark: 100,
        date: "2026-06-30",
        status: "graded",
        type: "Quiz",
      },
      {
        id: "a-2-3",
        name: "Eigenvalues Quiz",
        weight: 10,
        obtainedMark: 70,
        maxMark: 100,
        date: "2026-07-08",
        status: "graded",
        type: "Quiz",
      },
      {
        id: "a-2-4",
        name: "Midterm Calculus Test",
        weight: 20,
        obtainedMark: 65,
        maxMark: 100,
        date: "2026-07-12",
        status: "graded",
        type: "Test",
      },
      {
        id: "a-2-5",
        name: "Final Exam Paper",
        weight: 50,
        obtainedMark: null,
        maxMark: 100,
        date: "2026-08-12",
        status: "pending",
        type: "Exam",
      },
    ],
  },
  {
    id: "m-3",
    name: "Engineering Physics",
    code: "PHYS101",
    credits: 6,
    lecturer: "Dr. Helena Vance",
    semester: "Semester 1",
    year: "Year 1",
    passMark: 50,
    distinctionMark: 75,
    examWeight: 40,
    assessments: [
      {
        id: "a-3-1",
        name: "Mechanics Lab Report",
        weight: 20,
        obtainedMark: 95,
        maxMark: 100,
        date: "2026-06-25",
        status: "graded",
        type: "Practical",
      },
      {
        id: "a-3-2",
        name: "Thermodynamics Assignment",
        weight: 20,
        obtainedMark: 88,
        maxMark: 100,
        date: "2026-07-05",
        status: "graded",
        type: "Assignment",
      },
      {
        id: "a-3-3",
        name: "Waves and Optics Midterm",
        weight: 20,
        obtainedMark: 72,
        maxMark: 100,
        date: "2026-07-14",
        status: "graded",
        type: "Test",
      },
      {
        id: "a-3-4",
        name: "Final Laboratory Exam",
        weight: 40,
        obtainedMark: null,
        maxMark: 100,
        date: "2026-08-15",
        status: "pending",
        type: "Exam",
      },
    ],
  },
];

const defaultHistory: HistoryEntry[] = [
  {
    id: "h-1",
    date: "2026-07-18",
    time: "05:42",
    calculatorName: "Target Grade Calculator",
    inputs: {
      "Current Average (%)": 82.5,
      "Remaining Weight (%)": 40,
      "Desired Grade (%)": 85,
    },
    result: "Required remaining score: 88.8%. Desired outcome: ACHIEVABLE.",
  },
  {
    id: "h-2",
    date: "2026-07-18",
    time: "05:45",
    calculatorName: "Distinction Calculator",
    inputs: {
      "Current Average (%)": 73.1,
      "Remaining Weight (%)": 40,
      "Distinction Threshold (%)": 75,
    },
    result: "Distinction is POSSIBLE. Needed score on remaining is 77.9%. Max possible: 83.9%.",
  },
  {
    id: "h-3",
    date: "2026-07-18",
    time: "06:01",
    calculatorName: "GPA Calculator",
    inputs: {
      "Overall Average (%)": 79.5,
      "GPA Scale": "4.0",
    },
    result: "Converted GPA: 3.0 / 4.0. Class Grade: B.",
  },
];

const defaultSettings: ProfileSettings = {
  name: "Guest Student",
  institution: "",
  course: "",
  faculty: "",
  year: "",
  theme: "system",
  themeColor: "#2563EB",
  defaultGradingSystem: "ZA",
  precision: 1,
  notificationsEnabled: true,
  streak: 5,
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

const defaultUser: UserSession = {
  uid: "guest-uid",
  email: null,
  displayName: "Guest Student",
  isAnonymous: true,
  isLoggedIn: true,
};

// Safe localStorage interactions
export const localDB = {
  getModules(): Module[] {
    const modules = localStorage.getItem(MODULES_KEY);
    if (!modules) {
      this.saveModules(defaultModules);
      return defaultModules;
    }
    return JSON.parse(modules);
  },

  saveModules(modules: Module[]): void {
    localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
  },

  getHistory(): HistoryEntry[] {
    const history = localStorage.getItem(HISTORY_KEY);
    if (!history) {
      this.saveHistory(defaultHistory);
      return defaultHistory;
    }
    return JSON.parse(history);
  },

  saveHistory(history: HistoryEntry[]): void {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  addHistoryEntry(calculatorName: string, inputs: Record<string, string | number>, result: string): HistoryEntry {
    const history = this.getHistory();
    const now = new Date();
    const entry: HistoryEntry = {
      id: "h-" + Math.random().toString(36).substr(2, 9),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].substring(0, 5),
      calculatorName,
      inputs,
      result,
    };
    history.unshift(entry);
    this.saveHistory(history);
    return entry;
  },

  clearHistory(): void {
    this.saveHistory([]);
  },

  deleteHistoryEntry(id: string): void {
    const history = this.getHistory().filter((h) => h.id !== id);
    this.saveHistory(history);
  },

  getSettings(): ProfileSettings {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (!settings) {
      this.saveSettings(defaultSettings);
      return defaultSettings;
    }
    return JSON.parse(settings);
  },

  saveSettings(settings: ProfileSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getUser(): UserSession {
    const user = localStorage.getItem(USER_KEY);
    if (!user) {
      this.saveUser(defaultUser);
      return defaultUser;
    }
    return JSON.parse(user);
  },

  saveUser(user: UserSession): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem(USER_KEY);
    // Keep user state in guest mode, or return logged out
    const loggedOutUser: UserSession = {
      uid: "",
      email: null,
      displayName: null,
      isAnonymous: true,
      isLoggedIn: false,
    };
    this.saveUser(loggedOutUser);
  },
};

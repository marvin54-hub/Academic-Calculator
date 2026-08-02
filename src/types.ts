export interface Assessment {
  id: string;
  name: string;
  weight: number; // e.g. 20 for 20%
  obtainedMark: number | null; // null if pending
  maxMark: number; // e.g. 100
  date: string;
  status: "graded" | "pending";
  type: "Assignment" | "Test" | "Quiz" | "Project" | "Practical" | "Participation" | "Attendance" | "Exam";
}

export interface Module {
  id: string;
  name: string;
  code: string;
  credits: number;
  lecturer: string;
  semester: string; // e.g. "Semester 1", "Semester 2"
  year: string; // e.g. "Year 1", "Year 2"
  passMark: number; // default e.g. 50
  distinctionMark: number; // default e.g. 75 or 80
  examWeight: number; // percentage, e.g. 40%
  assessments: Assessment[];
}

export interface HistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  calculatorName: string;
  inputs: Record<string, string | number>;
  result: string;
}

export type ThemeMode = "light" | "dark" | "system";
export type GradingSystem = "ZA" | "US" | "UK" | "custom";

export interface CustomGradeBoundary {
  grade: string;
  minPercentage: number;
  gpaPoint: number;
}

export interface ProfileSettings {
  name: string;
  institution: string;
  course: string;
  faculty: string;
  year: string;
  theme: ThemeMode;
  themeColor: string; // hex
  defaultGradingSystem: GradingSystem;
  precision: number; // decimal places
  notificationsEnabled: boolean;
  streak: number;
  goalGpa: number;
  customGrades: CustomGradeBoundary[];
}

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
  isLoggedIn: boolean;
}

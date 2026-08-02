import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  ChevronRight,
  GraduationCap,
  Percent,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen,
  TrendingUp,
  X,
  FileText
} from "lucide-react";
import {
  calculateTargetGrade,
  calculatePassRequirement,
  calculateExamRequired,
  calculateAssignmentRequired,
  calculateSemesterAverage,
  percentageToGPA,
  calculateCGPA,
  calculateDistinctionPossible,
  calculateMinimumMarksToPass,
  calculateMaximumPossibleGrade,
} from "../utils/academicCalculations";

interface CalculatorDeckProps {
  onAddHistory: (name: string, inputs: Record<string, string | number>, result: string) => void;
  themeColor: string;
}

type CalcType =
  | "target"
  | "pass"
  | "exam"
  | "assignment"
  | "semester"
  | "gpa"
  | "cgpa"
  | "distinction"
  | "minimum"
  | "maximum"
  | null;

export default function CalculatorDeck({ onAddHistory, themeColor }: CalculatorDeckProps) {
  const [activeCalc, setActiveCalc] = useState<CalcType>(null);
  const [result, setResult] = useState<string | null>(null);

  // General Input States
  const [in1, setIn1] = useState(""); // Current Average / Coursework
  const [in2, setIn2] = useState(""); // Remaining Weight / Exam Weight
  const [in3, setIn3] = useState(""); // Desired Final Mark
  const [in4, setIn4] = useState(""); // Hurdle / count
  const [inGpaScale, setInGpaScale] = useState<"4.0" | "5.0" | "7.0">("4.0");

  // Semester Avg inputs (dynamic list)
  const [semModules, setSemModules] = useState<{ mark: string; credits: string }[]>([
    { mark: "75", credits: "6" },
    { mark: "68", credits: "8" },
  ]);

  // CGPA input states
  const [semesters, setSemesters] = useState<{ gpa: string; credits: string }[]>([
    { gpa: "3.2", credits: "24" },
    { gpa: "3.6", credits: "20" },
  ]);

  const calculators = [
    { id: "target" as const, title: "Target Grade Calculator", desc: "Calculate what you need on remaining exams/tasks to achieve a final target grade.", icon: <TrendingUp className="w-5 h-5 text-blue-400" /> },
    { id: "pass" as const, title: "Pass Calculator", desc: "Instantly check the minimum score required in remaining assessments to pass.", icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
    { id: "exam" as const, title: "Final Exam Calculator", desc: "Calculate what score you need on your final exam based on current coursework mark.", icon: <Percent className="w-5 h-5 text-violet-400" /> },
    { id: "assignment" as const, title: "Assignment Calculator", desc: "Find the average required score for remaining assignments to reach a coursework goal.", icon: <FileText className="w-5 h-5 text-pink-400" /> },
    { id: "semester" as const, title: "Semester Average Calculator", desc: "Calculate your weighted semester average based on credits and marks.", icon: <Calculator className="w-5 h-5 text-teal-400" /> },
    { id: "gpa" as const, title: "GPA Converter", desc: "Convert overall percentages to US 4.0, 5.0, or Australian 7.0 scales instantly.", icon: <GraduationCap className="w-5 h-5 text-amber-400" /> },
    { id: "cgpa" as const, title: "CGPA Calculator", desc: "Include previous semesters' GPAs and course loads to compute your cumulative score.", icon: <BookOpen className="w-5 h-5 text-indigo-400" /> },
    { id: "distinction" as const, title: "Distinction Check", desc: "Find out if a distinction (75%+ or 80%+) is still mathematically possible.", icon: <Award className="w-5 h-5 text-yellow-400" /> },
    { id: "minimum" as const, title: "Minimum Exam Marks", desc: "Check minimum exam scores required to pass with academic hurdles.", icon: <ChevronRight className="w-5 h-5 text-red-400" /> },
    { id: "maximum" as const, title: "Max Possible Grade", desc: "Calculate your maximum potential final mark if you score 100% on everything left.", icon: <HelpCircle className="w-5 h-5 text-cyan-400" /> },
  ];

  const handleOpen = (calcId: CalcType) => {
    setActiveCalc(calcId);
    setResult(null);
    setIn1("");
    setIn2("");
    setIn3("");
    setIn4("");
  };

  const handleCalculate = () => {
    let outputs = "";
    const inputsMap: Record<string, string | number> = {};

    switch (activeCalc) {
      case "target": {
        const avg = Number(in1) || 0;
        const rem = Number(in2) || 0;
        const target = Number(in3) || 0;
        const resObj = calculateTargetGrade(avg, rem, target);
        outputs = resObj.message;
        inputsMap["Current Average (%)"] = avg;
        inputsMap["Remaining Weight (%)"] = rem;
        inputsMap["Desired Grade (%)"] = target;
        break;
      }
      case "pass": {
        const avg = Number(in1) || 0;
        const rem = Number(in2) || 0;
        const passMarkVal = Number(in3) || 50;
        const resObj = calculatePassRequirement(avg, rem, passMarkVal);
        outputs = resObj.message;
        inputsMap["Current Average (%)"] = avg;
        inputsMap["Remaining Weight (%)"] = rem;
        inputsMap["Passing Grade (%)"] = passMarkVal;
        break;
      }
      case "exam": {
        const coursework = Number(in1) || 0;
        const weight = Number(in2) || 0;
        const target = Number(in3) || 0;
        const resObj = calculateExamRequired(coursework, weight, target);
        outputs = resObj.message;
        inputsMap["Coursework Mark (%)"] = coursework;
        inputsMap["Exam Weight (%)"] = weight;
        inputsMap["Desired Final (%)"] = target;
        break;
      }
      case "assignment": {
        const curAvg = Number(in1) || 0;
        const curWeight = Number(in2) || 0;
        const count = Number(in4) || 1;
        const remWeight = Number(in3) || 0;
        const target = Number(in4) || 75; // Using in4 for simplicity or defaults
        const resObj = calculateAssignmentRequired(curAvg, curWeight, count, remWeight, target);
        outputs = resObj.message;
        inputsMap["Current Average (%)"] = curAvg;
        inputsMap["Remaining Count"] = count;
        inputsMap["Remaining Weight (%)"] = remWeight;
        inputsMap["Desired Outcome (%)"] = target;
        break;
      }
      case "semester": {
        const modulesList = semModules.map((m) => ({
          mark: Number(m.mark) || 0,
          credits: Number(m.credits) || 0,
        }));
        const avg = calculateSemesterAverage(modulesList);
        outputs = `Your overall weighted Semester Average is ${avg}%.`;
        inputsMap["Number of Subjects"] = semModules.length;
        break;
      }
      case "gpa": {
        const percentage = Number(in1) || 0;
        const gpaResult = percentageToGPA(percentage, inGpaScale);
        outputs = `Grade: ${gpaResult.grade} | Converted GPA is ${gpaResult.gpa} on the ${inGpaScale} scale.`;
        inputsMap["Overall Score (%)"] = percentage;
        inputsMap["GPA Scale"] = inGpaScale;
        break;
      }
      case "cgpa": {
        const list = semesters.map((s) => ({
          gpa: Number(s.gpa) || 0,
          totalCredits: Number(s.credits) || 0,
        }));
        const cgpa = calculateCGPA(list);
        outputs = `Your overall Cumulative Grade Point Average (CGPA) is ${cgpa}.`;
        inputsMap["Number of Semesters"] = semesters.length;
        break;
      }
      case "distinction": {
        const avg = Number(in1) || 0;
        const rem = Number(in2) || 0;
        const distThreshold = Number(in3) || 75;
        const resObj = calculateDistinctionPossible(avg, rem, distThreshold);
        outputs = resObj.explanation;
        inputsMap["Current Average (%)"] = avg;
        inputsMap["Remaining Weight (%)"] = rem;
        inputsMap["Distinction Threshold (%)"] = distThreshold;
        break;
      }
      case "minimum": {
        const cw = Number(in1) || 0;
        const examW = Number(in2) || 0;
        const passVal = Number(in3) || 50;
        const hurdle = Number(in4) || 40;
        const resObj = calculateMinimumMarksToPass(cw, examW, passVal, hurdle);
        outputs = resObj.explanation;
        inputsMap["Coursework Mark (%)"] = cw;
        inputsMap["Exam Weight (%)"] = examW;
        inputsMap["Passing Score (%)"] = passVal;
        inputsMap["Hurdle Rule (%)"] = hurdle;
        break;
      }
      case "maximum": {
        const avg = Number(in1) || 0;
        const rem = Number(in2) || 0;
        const resObj = calculateMaximumPossibleGrade(avg, rem);
        outputs = resObj.explanation;
        inputsMap["Current Average (%)"] = avg;
        inputsMap["Remaining Weight (%)"] = rem;
        break;
      }
    }

    setResult(outputs);
    // Add to calculation history log
    onAddHistory(calculators.find((c) => c.id === activeCalc)?.title || "Calculator", inputsMap, outputs);
  };

  const addSemesterRow = () => {
    setSemModules([...semModules, { mark: "70", credits: "6" }]);
  };

  const addCgpaRow = () => {
    setSemesters([...semesters, { gpa: "3.5", credits: "24" }]);
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Intro header */}
      <div className="flex items-center space-x-3 mb-6 bg-white dark:bg-slate-900 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Academic Calculators</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-serif italic mt-0.5">Select a mathematical template below to calculate target scores.</p>
        </div>
      </div>

      {/* Grid of calculators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculators.map((c) => (
          <button
            key={c.id}
            onClick={() => handleOpen(c.id)}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:bg-slate-50/20 rounded-[2.2rem] p-5 text-left flex items-start space-x-4 transition hover:shadow-xs cursor-pointer group"
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-105 transition-transform duration-300">
              {c.icon}
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-slate-900 transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {c.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Calculator Dialog Modal */}
      <AnimatePresence>
        {activeCalc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <h3 className="font-serif font-bold italic text-slate-800 dark:text-slate-100 text-base">
                  {calculators.find((c) => c.id === activeCalc)?.title}
                </h3>
                <button
                  onClick={() => setActiveCalc(null)}
                  className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Inputs Form */}
              <div className="space-y-4">
                {activeCalc === "target" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Class Average (%)</label>
                      <input type="number" placeholder="e.g. 65" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Course Weight (%)</label>
                      <input type="number" placeholder="e.g. 40" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Desired Final Mark (%)</label>
                      <input type="number" placeholder="e.g. 75" value={in3} onChange={(e) => setIn3(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {activeCalc === "pass" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Class Average (%)</label>
                      <input type="number" placeholder="e.g. 48" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Course Weight (%)</label>
                      <input type="number" placeholder="e.g. 40" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Required Passing Mark (%)</label>
                      <input type="number" placeholder="Default 50%" value={in3} onChange={(e) => setIn3(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {activeCalc === "exam" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Coursework Mark (%)</label>
                      <input type="number" placeholder="e.g. 60" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam Weight (%)</label>
                      <input type="number" placeholder="e.g. 40" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Desired Final Mark (%)</label>
                      <input type="number" placeholder="e.g. 65" value={in3} onChange={(e) => setIn3(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {activeCalc === "assignment" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Assignment Mark (%)</label>
                      <input type="number" placeholder="e.g. 68" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed Assignments Weight (%)</label>
                      <input type="number" placeholder="e.g. 30" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Weight (%)</label>
                      <input type="number" placeholder="e.g. 20" value={in3} onChange={(e) => setIn3(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Desired Overall Grade (%)</label>
                      <input type="number" placeholder="e.g. 75" value={in4} onChange={(e) => setIn4(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {activeCalc === "semester" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Semester Subject list</span>
                    {semModules.map((sm, idx) => (
                      <div key={idx} className="flex space-x-3">
                        <input
                          type="number"
                          placeholder="Mark %"
                          value={sm.mark}
                          onChange={(e) => {
                            const copy = [...semModules];
                            copy[idx].mark = e.target.value;
                            setSemModules(copy);
                          }}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                        />
                        <input
                          type="number"
                          placeholder="Credits"
                          value={sm.credits}
                          onChange={(e) => {
                            const copy = [...semModules];
                            copy[idx].credits = e.target.value;
                            setSemModules(copy);
                          }}
                          className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSemesterRow}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 transition cursor-pointer"
                    >
                      + Add Subject Row
                    </button>
                  </div>
                )}

                {activeCalc === "gpa" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Percentage Mark (%)</label>
                      <input type="number" placeholder="e.g. 79.5" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">GPA Scale Target</label>
                      <select value={inGpaScale} onChange={(e) => setInGpaScale(e.target.value as any)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition">
                        <option value="4.0">US GPA (4.0 Scale)</option>
                        <option value="5.0">5.0 Scale</option>
                        <option value="7.0">Australian/UK GPA (7.0 Scale)</option>
                      </select>
                    </div>
                  </>
                )}

                {activeCalc === "cgpa" && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Semesters List</span>
                    {semesters.map((s, idx) => (
                      <div key={idx} className="flex space-x-3">
                        <input
                          type="number"
                          step="any"
                          placeholder="Semester GPA"
                          value={s.gpa}
                          onChange={(e) => {
                            const copy = [...semesters];
                            copy[idx].gpa = e.target.value;
                            setSemesters(copy);
                          }}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                        />
                        <input
                          type="number"
                          placeholder="Total Credits"
                          value={s.credits}
                          onChange={(e) => {
                            const copy = [...semesters];
                            copy[idx].credits = e.target.value;
                            setSemesters(copy);
                          }}
                          className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCgpaRow}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 transition cursor-pointer"
                    >
                      + Add Semester Row
                    </button>
                  </div>
                )}

                {activeCalc === "distinction" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Class Average (%)</label>
                      <input type="number" placeholder="e.g. 74" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Course Weight (%)</label>
                      <input type="number" placeholder="e.g. 40" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Distinction Threshold (%)</label>
                      <input type="number" placeholder="e.g. 75" value={in3} onChange={(e) => setIn3(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {activeCalc === "minimum" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Coursework Mark (%)</label>
                      <input type="number" placeholder="e.g. 58" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam Weight (%)</label>
                      <input type="number" placeholder="e.g. 40" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Passing Threshold (%)</label>
                      <input type="number" placeholder="e.g. 50" value={in3} onChange={(e) => setIn3(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam Hurdle Rule (%)</label>
                      <input type="number" placeholder="e.g. 40" value={in4} onChange={(e) => setIn4(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {activeCalc === "maximum" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Class Average (%)</label>
                      <input type="number" placeholder="e.g. 78" value={in1} onChange={(e) => setIn1(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining Course Weight (%)</label>
                      <input type="number" placeholder="e.g. 30" value={in2} onChange={(e) => setIn2(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition" />
                    </div>
                  </>
                )}

                {/* Calculate Trigger */}
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg active:scale-[0.99] transition cursor-pointer"
                  style={{ backgroundColor: themeColor }}
                >
                  Calculate Now
                </button>

                {/* Calculation Result Panel */}
                {result && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl space-y-2 mt-4 shadow-inner"
                  >
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                      <Award className="w-4 h-4" style={{ color: themeColor }} />
                      <span>Result Outcome</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed whitespace-pre-wrap">
                      {result}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

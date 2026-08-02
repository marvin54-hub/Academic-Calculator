import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, Edit3, Save, Calendar, CheckCircle2, Circle, AlertCircle, FileText, Sparkles } from "lucide-react";
import { Module, Assessment } from "../types";
import { calculateModuleAverage, calculateDistinctionPossible } from "../utils/academicCalculations";

interface AssessmentListProps {
  module: Module;
  onBack: () => void;
  onAddAssessment: (moduleId: string, assessment: Omit<Assessment, "id">) => void;
  onUpdateAssessment: (moduleId: string, assessmentId: string, updated: Partial<Assessment>) => void;
  onDeleteAssessment: (moduleId: string, assessmentId: string) => void;
  themeColor: string;
}

export default function AssessmentList({
  module,
  onBack,
  onAddAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  themeColor,
}: AssessmentListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formWeight, setFormWeight] = useState(10);
  const [formObtainedMark, setFormObtainedMark] = useState<string>("");
  const [formMaxMark, setFormMaxMark] = useState(100);
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState<"graded" | "pending">("graded");
  const [formType, setFormType] = useState<Assessment["type"]>("Assignment");

  const stats = calculateModuleAverage(module);
  const distinctionStats = calculateDistinctionPossible(stats.average, stats.remainingWeight, module.distinctionMark);

  const resetForm = () => {
    setFormName("");
    setFormWeight(10);
    setFormObtainedMark("");
    setFormMaxMark(100);
    setFormDate("");
    setFormStatus("graded");
    setFormType("Assignment");
    setEditingAssessment(null);
  };

  const handleStatusChange = (status: "graded" | "pending") => {
    setFormStatus(status);
    if (status === "pending") {
      setFormObtainedMark("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedObtained = formStatus === "graded" && formObtainedMark !== "" ? Number(formObtainedMark) : null;

    const payload = {
      name: formName,
      weight: Number(formWeight),
      obtainedMark: parsedObtained,
      maxMark: Number(formMaxMark),
      date: formDate || new Date().toISOString().split("T")[0],
      status: formStatus,
      type: formType,
    };

    if (editingAssessment) {
      onUpdateAssessment(module.id, editingAssessment.id, payload);
    } else {
      onAddAssessment(module.id, payload);
    }

    setIsAddOpen(false);
    resetForm();
  };

  const openEdit = (a: Assessment) => {
    setEditingAssessment(a);
    setFormName(a.name);
    setFormWeight(a.weight);
    setFormObtainedMark(a.obtainedMark !== null ? String(a.obtainedMark) : "");
    setFormMaxMark(a.maxMark);
    setFormDate(a.date);
    setFormStatus(a.status);
    setFormType(a.type);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Back & Module Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 transition cursor-pointer shadow-xs hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{module.code}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{module.semester}</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight mt-0.5">{module.name}</h2>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Overview Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module Grade Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2.2rem] relative overflow-hidden flex flex-col justify-between h-36 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Current Average</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-serif font-black italic text-[#2563EB]">
              {stats.completedWeight > 0 ? `${stats.average}%` : "—"}
            </span>
            <span className="text-xxs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">overall</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2">
            <span>Pass mark: {module.passMark}%</span>
            <span>Distinction: {module.distinctionMark}%</span>
          </div>
        </div>

        {/* Weights distribution card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2.2rem] flex flex-col justify-between h-36 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Weights Distribution</span>
          <div className="my-2 space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">COMPLETED WEIGHT</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{stats.completedWeight}% / 100%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stats.completedWeight}%`,
                  backgroundColor: themeColor,
                }}
              />
            </div>
          </div>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Remaining: {stats.remainingWeight}%</span>
        </div>

        {/* Distinction Possible card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2.2rem] flex flex-col justify-between h-36 relative overflow-hidden shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
            <span>DISTINCTION ELIGIBILITY</span>
          </span>
          <div className="my-2">
            <span className={`text-base font-bold uppercase tracking-wider ${distinctionStats.possible ? "text-amber-600" : "text-slate-400"}`}>
              {distinctionStats.possible ? "POSSIBLE" : "NOT POSSIBLE"}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold mt-0.5 uppercase tracking-wider">
              MAX ACHIEVABLE: {distinctionStats.maxPossible}%
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {distinctionStats.explanation}
          </p>
        </div>
      </div>

      {/* Assessment List */}
      <div className="space-y-4">
        <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">ASSESSMENTS LOG</h3>

        {module.assessments.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.2rem] text-center space-y-3 shadow-xs">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-slate-800 dark:text-slate-100 font-serif font-bold italic text-sm">No Assessments Yet</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
              Track assignments, exams, and quizzes by tapping the "+" button.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {module.assessments.map((a) => {
              const isGraded = a.status === "graded";
              const percentScore = isGraded && a.obtainedMark !== null ? (a.obtainedMark / a.maxMark) * 100 : 0;

              return (
                <div
                  key={a.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200/85 rounded-2xl p-4 flex items-center justify-between transition shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    {/* Status Icons */}
                    {isGraded ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">{a.name}</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200/30 uppercase tracking-wider">
                          {a.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                        <span>Weight: {a.weight}%</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{a.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-5">
                    {/* Mark display */}
                    <div className="text-right">
                      {isGraded && a.obtainedMark !== null ? (
                        <div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">
                            {a.obtainedMark} / {a.maxMark}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">
                            ({Math.round(percentScore * 10) / 10}%)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>PENDING</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAssessment(module.id, a.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Assessment Drawer */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.2rem] p-6 shadow-2xl">
            <h3 className="text-lg font-serif font-bold italic text-slate-800 dark:text-slate-100 mb-5 flex items-center space-x-2">
              <FileText className="w-5 h-5" style={{ color: themeColor }} />
              <span>{editingAssessment ? "Edit Assessment" : "Record Assessment"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assessment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Practical"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assessment Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as Assessment["type"])}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Test">Test</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Project">Project</option>
                    <option value="Practical">Practical</option>
                    <option value="Participation">Participation</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Weight (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assessment Status</label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("graded")}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      formStatus === "graded"
                        ? "bg-slate-100 border-slate-200 text-slate-800"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    Graded / Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("pending")}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      formStatus === "pending"
                        ? "bg-slate-100 border-slate-200 text-slate-800"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    Pending / Upcoming
                  </button>
                </div>
              </div>

              {formStatus === "graded" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Obtained Mark</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      placeholder="e.g. 85"
                      value={formObtainedMark}
                      onChange={(e) => setFormObtainedMark(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Maximum Mark</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formMaxMark}
                      onChange={(e) => setFormMaxMark(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date of Assessment</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-bold text-xs text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition cursor-pointer"
                  style={{ backgroundColor: themeColor }}
                >
                  {editingAssessment ? "Save Changes" : "Add Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

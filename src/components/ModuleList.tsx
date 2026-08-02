import React, { useState } from "react";
import { Plus, Search, BookOpen, Trash2, Edit3, Copy, Eye, SlidersHorizontal, Calendar, Award } from "lucide-react";
import { Module } from "../types";
import { calculateModuleAverage } from "../utils/academicCalculations";

interface ModuleListProps {
  modules: Module[];
  onSelectModule: (id: string) => void;
  onAddModule: (module: Omit<Module, "id">) => void;
  onUpdateModule: (id: string, updated: Partial<Module>) => void;
  onDeleteModule: (id: string) => void;
  onDuplicateModule: (id: string) => void;
  themeColor: string;
}

export default function ModuleList({
  modules,
  onSelectModule,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onDuplicateModule,
  themeColor,
}: ModuleListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCredits, setFormCredits] = useState(6);
  const [formLecturer, setFormLecturer] = useState("");
  const [formSemester, setFormSemester] = useState("Semester 1");
  const [formYear, setFormYear] = useState("Year 1");
  const [formPassMark, setFormPassMark] = useState(50);
  const [formDistinctionMark, setFormDistinctionMark] = useState(75);
  const [formExamWeight, setFormExamWeight] = useState(40);

  const resetForm = () => {
    setFormName("");
    setFormCode("");
    setFormCredits(6);
    setFormLecturer("");
    setFormSemester("Semester 1");
    setFormYear("Year 1");
    setFormPassMark(50);
    setFormDistinctionMark(75);
    setFormExamWeight(40);
    setEditingModule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    const payload = {
      name: formName,
      code: formCode.toUpperCase(),
      credits: Number(formCredits),
      lecturer: formLecturer,
      semester: formSemester,
      year: formYear,
      passMark: Number(formPassMark),
      distinctionMark: Number(formDistinctionMark),
      examWeight: Number(formExamWeight),
      assessments: editingModule ? editingModule.assessments : [],
    };

    if (editingModule) {
      onUpdateModule(editingModule.id, payload);
    } else {
      onAddModule(payload);
    }

    setIsAddOpen(false);
    resetForm();
  };

  const openEdit = (m: Module) => {
    setEditingModule(m);
    setFormName(m.name);
    setFormCode(m.code);
    setFormCredits(m.credits);
    setFormLecturer(m.lecturer);
    setFormSemester(m.semester);
    setFormYear(m.year);
    setFormPassMark(m.passMark);
    setFormDistinctionMark(m.distinctionMark);
    setFormExamWeight(m.examWeight);
    setIsAddOpen(true);
  };

  // Filters
  const semesters = ["All", "Semester 1", "Semester 2", "Semester 3", "Semester 4"];
  const years = ["All", "Year 1", "Year 2", "Year 3", "Year 4"];

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lecturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = semesterFilter === "All" || m.semester === semesterFilter;
    const matchesYear = yearFilter === "All" || m.year === yearFilter;

    return matchesSearch && matchesSemester && matchesYear;
  });

  return (
    <div className="space-y-6 pb-24 font-sans">
      {/* Search & Action Bar */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search modules (code, name, lecturer)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 transition shadow-xs"
          />
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 text-white shadow-lg shadow-blue-50 cursor-pointer active:scale-[0.98] transition shrink-0"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-3 overflow-x-auto py-1">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        
        {/* Semester Filter */}
        <div className="flex items-center space-x-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sem:</span>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none shadow-xs"
          >
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Year:</span>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none shadow-xs"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.2rem] text-center space-y-3 shadow-xs">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-slate-800 dark:text-slate-100 font-serif font-bold italic text-sm">No Subjects Found</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
            Try adjusting your search filters or click "Add Subject" to create a new module.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map((m) => {
            const stats = calculateModuleAverage(m);
            const isPassing = stats.average >= m.passMark;
            const hasDistinction = stats.average >= m.distinctionMark;

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200/80 rounded-[2.2rem] p-5 shadow-xs hover:shadow-sm transition relative overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Accent Bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: themeColor }}
                />

                {/* Module Header */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full tracking-wider uppercase border border-slate-200/30">
                      {m.code}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{m.semester}</span>
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-base leading-tight hover:text-[#2563EB] cursor-pointer" onClick={() => onSelectModule(m.id)}>
                    {m.name}
                  </h3>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center space-x-1">
                    <span>Lecturer:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{m.lecturer || "TBA"}</span>
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

                {/* Stats row */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Current Average</span>
                    <div className="flex items-baseline space-x-1.5 mt-0.5">
                      <span className="text-xl font-serif font-bold italic text-slate-800 dark:text-slate-100">
                        {stats.completedWeight > 0 ? `${stats.average}%` : "—"}
                      </span>
                      {stats.completedWeight > 0 && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            hasDistinction
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : isPassing
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        >
                          {hasDistinction ? "Distinction" : isPassing ? "Passing" : "Failing"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Credits</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5 block">{m.credits} Units</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500">
                    <span>COMPLETED WEIGHT</span>
                    <span>{stats.completedWeight}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.completedWeight}%`,
                        backgroundColor: themeColor,
                      }}
                    />
                  </div>
                </div>

                {/* Module Actions */}
                <div className="flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onSelectModule(m.id)}
                    className="flex items-center space-x-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Grades</span>
                  </button>

                  <div className="flex space-x-2.5">
                    <button
                      onClick={() => onDuplicateModule(m.id)}
                      title="Duplicate Module"
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(m)}
                      title="Edit Module"
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteModule(m.id)}
                      title="Delete Module"
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Drawer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.2rem] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-serif font-bold italic text-slate-800 dark:text-slate-100 mb-6 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" style={{ color: themeColor }} />
              <span>{editingModule ? "Edit Subject Module" : "Create New Subject"}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linear Algebra"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Module Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MATH201"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Credits</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  >
                    {semesters.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Year</label>
                  <select
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  >
                    {years.filter((y) => y !== "All").map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lecturer Name</label>
                <input
                  type="text"
                  placeholder="Prof. John Doe"
                  value={formLecturer}
                  onChange={(e) => setFormLecturer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pass Mark (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formPassMark}
                    onChange={(e) => setFormPassMark(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Distinction (%)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formDistinctionMark}
                    onChange={(e) => setFormDistinctionMark(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam Weight (%)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={formExamWeight}
                    onChange={(e) => setFormExamWeight(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-slate-300 focus:bg-white dark:focus:bg-slate-700 transition"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 font-bold text-sm text-white rounded-xl shadow-lg hover:opacity-90 active:scale-[0.99] transition cursor-pointer"
                  style={{ backgroundColor: themeColor }}
                >
                  {editingModule ? "Save Changes" : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

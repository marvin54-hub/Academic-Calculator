import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Award, Flame, GraduationCap, TrendingUp, BookOpen, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { Module, ProfileSettings } from "../types";
import { calculateModuleAverage } from "../utils/academicCalculations";

interface HomeScreenProps {
  modules: Module[];
  settings: ProfileSettings;
  onNavigate: (tab: "calculate" | "subjects" | "history" | "profile") => void;
  themeColor: string;
}

export default function HomeScreen({ modules, settings, onNavigate, themeColor }: HomeScreenProps) {
  // Compute overall average and stats
  let totalCredits = 0;
  let earnedValue = 0;
  let totalCompletedWeight = 0;

  const chartData = modules.map((m) => {
    const stats = calculateModuleAverage(m);
    if (stats.completedWeight > 0) {
      totalCredits += m.credits;
      earnedValue += stats.average * m.credits;
      totalCompletedWeight += stats.completedWeight;
    }
    return {
      name: m.code,
      Average: Math.round(stats.average * 10) / 10,
    };
  }).filter((c) => c.Average > 0);

  const overallAvg = totalCredits > 0 ? earnedValue / totalCredits : 0;
  const roundedAvg = Math.round(overallAvg * 10) / 10;

  // Simulate GPA conversion
  const currentGpa = overallAvg > 0 ? Math.round((overallAvg / 25) * 10) / 10 : 0;
  const gpaGap = Math.max(0, settings.goalGpa - currentGpa);

  return (
    <div className="space-y-6 pb-24 font-sans text-slate-700 dark:text-slate-300">
      {/* Greetings Banner */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
            Welcome back, <span className="font-bold font-serif italic text-[#2563EB]">{settings.name}</span>
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-[0.2em] font-bold">
            Calculate. Plan. Achieve.
          </p>
        </div>

        {/* Study Streak Card */}
        <div className="flex items-center space-x-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2.5 rounded-2xl shrink-0 shadow-xs">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
          <div>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 block leading-none">{settings.streak} Days</span>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block mt-0.5">Study Streak</span>
          </div>
        </div>
      </div>

      {/* Target GPA Progress Meter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800/60 p-6 rounded-[2.2rem] space-y-5 shadow-xs">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Core Progress Target</span>
            <h3 className="font-serif font-bold italic text-slate-800 dark:text-slate-100 text-base">Target GPA Progression</h3>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Goal Gap</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-500/20">
              {gpaGap > 0 ? `-${Math.round(gpaGap * 10) / 10} GPA` : "Goal Achieved! 🎉"}
            </span>
          </div>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC]/90 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-center border-r border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Current CGPA</span>
            <span className="text-2xl font-serif font-black italic text-[#2563EB] mt-1 block">{currentGpa || "—"}</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Target Goal GPA</span>
            <span className="text-2xl font-serif font-bold italic text-slate-700 dark:text-slate-300 mt-1 block">{settings.goalGpa}</span>
          </div>
        </div>

        {/* Action Prompt */}
        {gpaGap > 0 && modules.length > 0 && (
          <div className="flex items-start space-x-2.5 p-3.5 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100/50 dark:border-blue-500/20 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <span className="font-serif italic text-slate-800 dark:text-slate-100 font-medium">{settings.name}</span>, you are very close to your academic milestone. You require an average of{" "}
              <strong className="text-[#2563EB] font-bold">
                {Math.min(100, Math.round((settings.goalGpa * 25) * 1.05))}%
              </strong>{" "}
              across remaining homework tasks and exams to secure your distinction.
            </span>
          </div>
        )}
      </div>

      {/* Stats Bento Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-center space-y-1 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Average</span>
          <span className="text-base font-serif font-bold italic text-slate-800 dark:text-slate-100">{roundedAvg > 0 ? `${roundedAvg}%` : "—"}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-center space-y-1 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Credits</span>
          <span className="text-base font-serif font-bold italic text-slate-800 dark:text-slate-100">{totalCredits || 0} Units</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl text-center space-y-1 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Subjects</span>
          <span className="text-base font-serif font-bold italic text-slate-800 dark:text-slate-100">{modules.length}</span>
        </div>
      </div>

      {/* Recharts Analytics Curve */}
      {chartData.length > 1 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.2rem] space-y-4 shadow-xs">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">GRADE TREND ANALYSIS</span>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} fontWeight="bold" domain={[40, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                  labelStyle={{ color: "#475569", fontWeight: "bold", fontSize: "10px" }}
                  itemStyle={{ color: "#1e293b", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="Average" stroke={themeColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorGpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action shortcuts / Module previews */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">SUBJECT OVERVIEW</h3>
          <button
            onClick={() => onNavigate("subjects")}
            className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>All Subjects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] text-center space-y-2.5 shadow-xs">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-slate-800 dark:text-slate-100 font-serif font-bold italic text-sm">No active subjects</h4>
            <p className="text-xxs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Go to Subjects tab to register your modules.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {modules.slice(0, 3).map((m) => {
              const stats = calculateModuleAverage(m);
              return (
                <div
                  key={m.id}
                  onClick={() => onNavigate("subjects")}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200/80 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer shadow-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200/40 dark:border-slate-700/40 uppercase">
                      {m.code}
                    </span>
                    <h4 className="font-serif font-bold text-slate-800 dark:text-slate-100 text-sm mt-1.5">{m.name}</h4>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] block">Average</span>
                    <span className="text-sm font-bold text-[#2563EB]">
                      {stats.completedWeight > 0 ? `${stats.average}%` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick fallback helper inside component since we defined pass requirement inside deck only
function calculatePassRequirement(average: number, remainingWeight: number, passThreshold: number) {
  if (remainingWeight <= 0) {
    return { possible: average >= passThreshold, message: average >= passThreshold ? "You have already passed!" : "No weights left to pass." };
  }
  const completedWeight = 100 - remainingWeight;
  const currentEarned = (average * completedWeight) / 100;
  const neededOnRemaining = ((passThreshold - currentEarned) / remainingWeight) * 100;
  
  if (neededOnRemaining <= 0) {
    return { possible: true, message: `Passed! You've already earned enough marks (${average}%) to pass. You require 0% on remaining assignments.` };
  } else if (neededOnRemaining > 100) {
    return { possible: false, message: `Mathematically impossible to pass. Even with 100% on all remaining work, you can only achieve a maximum final grade of ${(currentEarned + remainingWeight).toFixed(1)}%.` };
  } else {
    return { possible: true, message: `To pass this module (at least ${passThreshold}%), you need to average at least ${neededOnRemaining.toFixed(1)}% on all remaining assignments/exams.` };
  }
}

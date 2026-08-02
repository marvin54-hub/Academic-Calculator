import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calculator, Award, GraduationCap, ArrowRight, Check } from "lucide-react";

interface SplashAndOnboardingProps {
  onComplete: () => void;
  themeColor: string;
}

export default function SplashAndOnboarding({ onComplete, themeColor }: SplashAndOnboardingProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const onboardingPages = [
    {
      title: "Track All Your Academic Marks",
      description: "Easily organize assignments, tests, and quizzes. Manage weight distributions and stay on top of your semester modules with absolute ease.",
      icon: <Calculator className="w-16 h-16" style={{ color: themeColor }} />,
    },
    {
      title: "Know Exactly What Marks You Need",
      description: "Remove the guesswork. Instantly compute the exact scores you need in upcoming exams and assignments to pass or achieve distinctions.",
      icon: <Award className="w-16 h-16" style={{ color: themeColor }} />,
    },
    {
      title: "Graduate with Confidence",
      description: "Visualize your GPA and CGPA progress, unlock milestones, track your academic streak, and plan for graduation day with an AI Assistant by your side.",
      icon: <GraduationCap className="w-16 h-16" style={{ color: themeColor }} />,
    },
  ];

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center text-center p-6"
          >
            {/* Ambient background glow */}
            <div
              className="absolute w-72 h-72 rounded-full filter blur-3xl opacity-20 -z-10 animate-pulse"
              style={{ backgroundColor: themeColor }}
            />
            
            <motion.div
              initial={{ scale: 0.7, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-tr flex items-center justify-center shadow-2xl mb-6 border border-white/10"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeColor}dd, ${themeColor})`,
              }}
            >
              <GraduationCap className="w-12 h-12 text-white stroke-[1.5]" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-extrabold tracking-tight"
            >
              Academic Calculator
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              transition={{ delay: 0.7 }}
              className="text-sm mt-3 uppercase tracking-widest font-semibold"
              style={{ color: themeColor }}
            >
              Calculate. Plan. Achieve.
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ delay: 0.9, duration: 1 }}
              className="h-1 rounded-full mt-6 opacity-60"
              style={{ backgroundColor: themeColor }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto p-6 flex flex-col justify-between h-[85vh]"
          >
            {/* Top Logo / Label */}
            <div className="flex items-center justify-center space-x-2 opacity-80">
              <GraduationCap className="w-5 h-5" style={{ color: themeColor }} />
              <span className="font-bold text-sm tracking-wide uppercase">Academic Calculator</span>
            </div>

            {/* Content Slider */}
            <div className="my-auto py-10 text-center flex flex-col items-center">
              <motion.div
                key={`icon-${currentPage}`}
                initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="w-32 h-32 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-lg mb-8"
              >
                {onboardingPages[currentPage].icon}
              </motion.div>

              <motion.h2
                key={`title-${currentPage}`}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold tracking-tight text-slate-100"
              >
                {onboardingPages[currentPage].title}
              </motion.h2>

              <motion.p
                key={`desc-${currentPage}`}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-slate-300 mt-4 leading-relaxed max-w-xs mx-auto"
              >
                {onboardingPages[currentPage].description}
              </motion.p>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col items-center space-y-6">
              {/* Pagination Dots */}
              <div className="flex space-x-2.5">
                {onboardingPages.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: idx === currentPage ? "24px" : "8px",
                      backgroundColor: idx === currentPage ? themeColor : "rgba(255, 255, 255, 0.2)",
                    }}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={handleNext}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-xl"
                style={{ backgroundColor: themeColor }}
              >
                <span>
                  {currentPage === onboardingPages.length - 1 ? "Get Started" : "Continue"}
                </span>
                {currentPage === onboardingPages.length - 1 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

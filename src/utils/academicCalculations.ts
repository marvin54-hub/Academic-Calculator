import { Module, Assessment } from "../types";

/**
 * Calculate the current average of a module based on its graded assessments
 */
export function calculateModuleAverage(module: Module): {
  average: number;
  completedWeight: number;
  earnedMarks: number;
  remainingWeight: number;
} {
  const gradedAssessments = module.assessments.filter(
    (a) => a.status === "graded" && a.obtainedMark !== null
  );

  let completedWeight = 0;
  let earnedMarks = 0;

  gradedAssessments.forEach((a) => {
    if (a.obtainedMark !== null) {
      completedWeight += a.weight;
      earnedMarks += (a.obtainedMark / a.maxMark) * a.weight;
    }
  });

  const remainingWeight = 100 - completedWeight;
  const average = completedWeight > 0 ? (earnedMarks / completedWeight) * 100 : 0;

  return {
    average: Math.round(average * 100) / 100,
    completedWeight,
    earnedMarks: Math.round(earnedMarks * 100) / 100,
    remainingWeight,
  };
}

/**
 * 1. Target Grade Calculator
 * Formula: Required = (Desired - EarnedMarks) / (RemainingWeight / 100)
 */
export function calculateTargetGrade(
  currentAverage: number,
  remainingWeight: number,
  desiredFinalMark: number
): { requiredMark: number; message: string; possible: boolean } {
  if (remainingWeight <= 0) {
    const isMet = currentAverage >= desiredFinalMark;
    return {
      requiredMark: 0,
      possible: isMet,
      message: isMet
        ? `You have already achieved your target final mark with ${currentAverage}%!`
        : `Your course is complete and your final mark is ${currentAverage}%, which is below your target of ${desiredFinalMark}%.`,
    };
  }

  const completedWeight = 100 - remainingWeight;
  const earnedMarks = (currentAverage / 100) * completedWeight;
  const neededMarks = desiredFinalMark - earnedMarks;
  
  if (neededMarks <= 0) {
    return {
      requiredMark: 0,
      possible: true,
      message: `You've already secured enough marks (${earnedMarks.toFixed(1)}%) to achieve your target of ${desiredFinalMark}%! You can score 0% on remaining assessments and still pass/reach your goal.`,
    };
  }

  const requiredMark = (neededMarks / remainingWeight) * 100;

  if (requiredMark > 100) {
    return {
      requiredMark: Math.round(requiredMark * 100) / 100,
      possible: false,
      message: `Mathematically impossible. You would need to score ${requiredMark.toFixed(1)}% in the remaining assessments, but the maximum possible score is 100%.`,
    };
  }

  return {
    requiredMark: Math.round(requiredMark * 100) / 100,
    possible: true,
    message: `You need to average ${requiredMark.toFixed(1)}% in your remaining ${remainingWeight}% weighted assessments to achieve ${desiredFinalMark}%.`,
  };
}

/**
 * 2. Pass Calculator
 * Same concept as target grade, but desired is fixed to the pass mark.
 */
export function calculatePassRequirement(
  currentAverage: number,
  remainingWeight: number,
  passMark: number = 50
): { requiredMark: number; message: string; possible: boolean } {
  return calculateTargetGrade(currentAverage, remainingWeight, passMark);
}

/**
 * 3. Exam Calculator
 * Coursework contribution + Exam contribution = Desired
 */
export function calculateExamRequired(
  courseworkMark: number,
  examWeight: number,
  desiredFinalMark: number
): { requiredMark: number; message: string; possible: boolean } {
  if (examWeight <= 0 || examWeight >= 100) {
    return {
      requiredMark: 0,
      possible: false,
      message: "Exam weight must be greater than 0% and less than 100%.",
    };
  }

  const courseworkWeight = 100 - examWeight;
  const courseworkContribution = (courseworkMark / 100) * courseworkWeight;
  const neededExamContribution = desiredFinalMark - courseworkContribution;

  if (neededExamContribution <= 0) {
    return {
      requiredMark: 0,
      possible: true,
      message: `Your coursework mark of ${courseworkMark}% alone has already secured ${courseworkContribution.toFixed(1)}% of your final grade, passing your target of ${desiredFinalMark}%! You don't need any marks in the final exam.`,
    };
  }

  const requiredExamMark = (neededExamContribution / examWeight) * 100;

  if (requiredExamMark > 100) {
    return {
      requiredMark: Math.round(requiredExamMark * 100) / 100,
      possible: false,
      message: `Impossible. You would need to score ${requiredExamMark.toFixed(1)}% in the final exam to achieve ${desiredFinalMark}%.`,
    };
  }

  return {
    requiredMark: Math.round(requiredExamMark * 100) / 100,
    possible: true,
    message: `You need a score of ${requiredExamMark.toFixed(1)}% in your final exam (${examWeight}% weight) to achieve a final mark of ${desiredFinalMark}%.`,
  };
}

/**
 * 4. Assignment Calculator
 * Calculates required average on remaining assignments
 */
export function calculateAssignmentRequired(
  currentAverage: number,
  currentWeight: number,
  remainingAssignmentsCount: number,
  remainingWeight: number,
  desiredAverage: number
): { requiredMarkPerAssignment: number; message: string; possible: boolean } {
  if (remainingAssignmentsCount <= 0 || remainingWeight <= 0) {
    const met = currentAverage >= desiredAverage;
    return {
      requiredMarkPerAssignment: 0,
      possible: met,
      message: met ? "Goal already met!" : "No remaining assessments to change the average.",
    };
  }

  const earned = (currentAverage / 100) * currentWeight;
  const needed = desiredAverage - earned;
  const totalWeight = currentWeight + remainingWeight;
  
  // Adjusted desired in terms of the completed/remaining sets
  const neededTotalGradePoints = (desiredAverage / 100) * totalWeight;
  const neededFromRemaining = neededTotalGradePoints - earned;

  if (neededFromRemaining <= 0) {
    return {
      requiredMarkPerAssignment: 0,
      possible: true,
      message: "You have already secured enough marks to hit this target!",
    };
  }

  const requiredPercentageForRemaining = (neededFromRemaining / remainingWeight) * 100;

  if (requiredPercentageForRemaining > 100) {
    return {
      requiredMarkPerAssignment: Math.round(requiredPercentageForRemaining * 100) / 100,
      possible: false,
      message: `Impossible. You would need to average ${requiredPercentageForRemaining.toFixed(1)}% on your remaining assignments.`,
    };
  }

  return {
    requiredMarkPerAssignment: Math.round(requiredPercentageForRemaining * 100) / 100,
    possible: true,
    message: `You need an average of ${requiredPercentageForRemaining.toFixed(1)}% across your next ${remainingAssignmentsCount} assignments (total weight ${remainingWeight}%) to hit an overall average of ${desiredAverage}%.`,
  };
}

/**
 * 5. Semester Average Calculator
 * Weighted by credits
 */
export function calculateSemesterAverage(modules: { mark: number; credits: number }[]): number {
  let totalCredits = 0;
  let totalWeightedMarks = 0;

  modules.forEach((m) => {
    if (m.credits > 0) {
      totalCredits += m.credits;
      totalWeightedMarks += m.mark * m.credits;
    }
  });

  return totalCredits > 0 ? Math.round((totalWeightedMarks / totalCredits) * 100) / 100 : 0;
}

/**
 * 6. GPA Calculator Conversion
 */
export function percentageToGPA(percentage: number, scale: "4.0" | "5.0" | "7.0"): {
  gpa: number;
  grade: string;
} {
  if (scale === "4.0") {
    if (percentage >= 85) return { gpa: 4.0, grade: "A" };
    if (percentage >= 75) return { gpa: 3.0, grade: "B" };
    if (percentage >= 65) return { gpa: 2.0, grade: "C" };
    if (percentage >= 50) return { gpa: 1.0, grade: "D" };
    return { gpa: 0.0, grade: "F" };
  } else if (scale === "5.0") {
    if (percentage >= 85) return { gpa: 5.0, grade: "A" };
    if (percentage >= 75) return { gpa: 4.0, grade: "B" };
    if (percentage >= 65) return { gpa: 3.0, grade: "C" };
    if (percentage >= 50) return { gpa: 2.0, grade: "D" };
    return { gpa: 0.0, grade: "F" };
  } else {
    // 7.0 Scale
    if (percentage >= 85) return { gpa: 7.0, grade: "HD" }; // High Distinction
    if (percentage >= 75) return { gpa: 6.0, grade: "D" };  // Distinction
    if (percentage >= 65) return { gpa: 5.0, grade: "C" };  // Credit
    if (percentage >= 50) return { gpa: 4.0, grade: "P" };  // Pass
    if (percentage >= 45) return { gpa: 3.0, grade: "F1" }; // Fail level 1
    if (percentage >= 40) return { gpa: 2.0, grade: "F2" }; // Fail level 2
    return { gpa: 1.0, grade: "F3" };
  }
}

/**
 * Convert GPA to Percentage (approximated)
 */
export function gpaToPercentage(gpa: number, scale: "4.0" | "5.0" | "7.0"): number {
  if (scale === "4.0") {
    return gpa * 25; // Simple linear approximation
  } else if (scale === "5.0") {
    return gpa * 20;
  } else {
    return (gpa / 7) * 100;
  }
}

/**
 * 7. CGPA Calculator
 */
export function calculateCGPA(
  semesters: { gpa: number; totalCredits: number }[]
): number {
  let weightedGPASum = 0;
  let totalCreditsSum = 0;

  semesters.forEach((s) => {
    if (s.totalCredits > 0) {
      totalCreditsSum += s.totalCredits;
      weightedGPASum += s.gpa * s.totalCredits;
    }
  });

  return totalCreditsSum > 0 ? Math.round((weightedGPASum / totalCreditsSum) * 100) / 100 : 0;
}

/**
 * 8. Distinction Calculator
 */
export function calculateDistinctionPossible(
  currentAverage: number,
  remainingWeight: number,
  distinctionMark: number = 75
): { possible: boolean; maxPossible: number; explanation: string } {
  const completedWeight = 100 - remainingWeight;
  const currentEarned = (currentAverage / 100) * completedWeight;
  const maxPossible = currentEarned + remainingWeight;

  const possible = maxPossible >= distinctionMark;
  let explanation = "";

  if (possible) {
    const requiredForDistinction = ((distinctionMark - currentEarned) / remainingWeight) * 100;
    explanation = `Distinction is POSSIBLE! You currently have ${currentEarned.toFixed(1)}% out of ${completedWeight}%. To hit distinction (${distinctionMark}%), you need to average at least ${requiredForDistinction.toFixed(1)}% in your remaining assessments.`;
  } else {
    explanation = `Distinction is NOT possible. Your maximum final score is ${maxPossible.toFixed(1)}% (if you score 100% in all remaining assessments), which is below the distinction threshold of ${distinctionMark}%. This is because you have missed too many marks in completed assessments.`;
  }

  return {
    possible,
    maxPossible: Math.round(maxPossible * 100) / 100,
    explanation,
  };
}

/**
 * 9. Minimum Marks Calculator
 * Finds the minimum exam mark required to pass, given coursework and hurdle rules
 */
export function calculateMinimumMarksToPass(
  courseworkMark: number,
  examWeight: number,
  passMark: number = 50,
  examHurdle: number = 40 // universities often mandate at least 40% in final exam to pass
): { requiredExamMark: number; explanation: string } {
  const courseworkWeight = 100 - examWeight;
  const courseworkContribution = (courseworkMark / 100) * courseworkWeight;
  const neededFromExam = passMark - courseworkContribution;
  
  let requiredExamMark = (neededFromExam / examWeight) * 100;
  if (requiredExamMark < 0) requiredExamMark = 0;
  
  let finalRequired = Math.max(requiredExamMark, examHurdle);
  
  let explanation = "";
  if (finalRequired === examHurdle && courseworkContribution >= passMark) {
    explanation = `You have already passed the 50% course threshold via coursework alone! However, a hurdle of ${examHurdle}% is required in the exam, so you must get at least ${examHurdle}% in the final exam.`;
  } else if (finalRequired === examHurdle) {
    explanation = `You only need ${requiredExamMark.toFixed(1)}% to pass 50% overall. However, because of the academic hurdle rule, you MUST score at least ${examHurdle}% in the exam to pass.`;
  } else if (finalRequired > 100) {
    explanation = `It is mathematically impossible to pass. Even with 100% on the final exam, your coursework mark of ${courseworkMark}% is too low to reach 50% overall.`;
  } else {
    explanation = `You need a minimum exam mark of ${finalRequired.toFixed(1)}% to pass. This will give you an overall grade of ${passMark}%.`;
  }

  return {
    requiredExamMark: Math.round(finalRequired * 100) / 100,
    explanation,
  };
}

/**
 * 10. Maximum Possible Grade Calculator
 */
export function calculateMaximumPossibleGrade(
  currentAverage: number,
  remainingWeight: number
): { maxGrade: number; explanation: string } {
  const completedWeight = 100 - remainingWeight;
  const earned = (currentAverage / 100) * completedWeight;
  const maxPossible = earned + remainingWeight;

  return {
    maxGrade: Math.round(maxPossible * 100) / 100,
    explanation: `Your maximum possible grade is ${maxPossible.toFixed(1)}%. This assumes a perfect score (100%) on your remaining ${remainingWeight}% of course weighting.`,
  };
}

import { HabitLog } from "@/hooks/useHabits";

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalSuccesses: number;
  totalLogs: number;
}

/**
 * Calculate streak and stats for a habit based on logs
 */
export function calculateHabitStats(
  habitId: string,
  logs: HabitLog[],
  upToDate?: Date
): HabitStats {
  const habitLogs = logs
    .filter((log) => log.habit_id === habitId && log.status === 1)
    .map((log) => new Date(log.log_date))
    .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

  const allHabitLogs = logs.filter((log) => log.habit_id === habitId);
  const totalSuccesses = allHabitLogs.filter((l) => l.status === 1).length;
  const totalLogs = allHabitLogs.length;
  const completionRate = totalLogs > 0 ? (totalSuccesses / totalLogs) * 100 : 0;

  if (habitLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      completionRate,
      totalSuccesses,
      totalLogs,
    };
  }

  const today = upToDate || new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate current streak (must include today or yesterday)
  let currentStreak = 0;
  const checkDate = new Date(today);

  // Check if today has a success
  const todayStr = formatDate(today);
  const hasTodaySuccess = habitLogs.some(
    (d) => formatDate(d) === todayStr
  );

  if (!hasTodaySuccess) {
    // Check yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = formatDate(checkDate);
    const hasYesterdaySuccess = habitLogs.some(
      (d) => formatDate(d) === yesterdayStr
    );
    if (!hasYesterdaySuccess) {
      // Streak is broken
      currentStreak = 0;
    } else {
      currentStreak = countConsecutiveDays(habitLogs, checkDate);
    }
  } else {
    currentStreak = countConsecutiveDays(habitLogs, today);
  }

  // Calculate longest streak
  const sortedDates = habitLogs
    .map((d) => formatDate(d))
    .filter((v, i, a) => a.indexOf(v) === i) // unique dates
    .sort();

  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    completionRate,
    totalSuccesses,
    totalLogs,
  };
}

function countConsecutiveDays(successDates: Date[], startDate: Date): number {
  let count = 0;
  const checkDate = new Date(startDate);

  while (true) {
    const dateStr = formatDate(checkDate);
    const hasSuccess = successDates.some((d) => formatDate(d) === dateStr);

    if (hasSuccess) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return count;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Check if a milestone was just achieved
 */
export function checkMilestone(
  previousStreak: number,
  newStreak: number
): number | null {
  const milestones = [3, 7, 14, 21, 30, 60, 90, 100, 180, 365];

  for (const milestone of milestones) {
    if (previousStreak < milestone && newStreak >= milestone) {
      return milestone;
    }
  }

  return null;
}

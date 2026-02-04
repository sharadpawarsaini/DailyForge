import { useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { HabitCell } from "./HabitCell";
import { StreakBadge } from "./StreakBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Habit, HabitLog } from "@/hooks/useHabits";
import { calculateHabitStats, checkMilestone } from "@/lib/streakUtils";
import { fireConfetti, fireSmallCelebration } from "@/lib/confetti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HabitGridProps {
  habits: Habit[];
  logs: HabitLog[];
  year: number;
  month: number;
  onCellClick: (habitId: string, date: string, currentStatus: number) => void;
  onDeleteHabit: (habitId: string) => void;
}

export function HabitGrid({
  habits,
  logs,
  year,
  month,
  onCellClick,
  onDeleteHabit,
}: HabitGridProps) {
  const streakCache = useRef<Map<string, number>>(new Map());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  const logsMap = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach((log) => {
      map.set(`${log.habit_id}-${log.log_date}`, log.status);
    });
    return map;
  }, [logs]);

  const habitStats = useMemo(() => {
    const stats = new Map<string, ReturnType<typeof calculateHabitStats>>();
    habits.forEach((habit) => {
      const stat = calculateHabitStats(habit.id, logs);
      stats.set(habit.id, stat);
      streakCache.current.set(habit.id, stat.currentStreak);
    });
    return stats;
  }, [habits, logs]);

  const getStatus = (habitId: string, day: number): number => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return logsMap.get(`${habitId}-${dateStr}`) ?? 0;
  };

  const cycleStatus = (current: number): number => {
    return (current + 1) % 3; // 0 -> 1 -> 2 -> 0
  };

  const handleCellClick = useCallback((habitId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const currentStatus = getStatus(habitId, day);
    const newStatus = cycleStatus(currentStatus);
    
    // Check for milestone on success
    if (newStatus === 1) {
      const previousStreak = streakCache.current.get(habitId) || 0;
      // Simulate new streak (optimistic)
      const potentialNewStreak = previousStreak + 1;
      const milestone = checkMilestone(previousStreak, potentialNewStreak);
      
      if (milestone) {
        // Fire big confetti for milestones
        setTimeout(() => fireConfetti(), 100);
      } else if (potentialNewStreak > 1) {
        // Small celebration for continuing streak
        setTimeout(() => fireSmallCelebration(), 100);
      }
    }
    
    onCellClick(habitId, dateStr, newStatus);
  }, [year, month, logsMap, onCellClick]);

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long" });

  // Calculate monthly completion for each habit
  const getMonthlyCompletion = (habitId: string): number => {
    let successCount = 0;
    const maxDays = isCurrentMonth ? todayDay : daysInMonth;
    
    for (let day = 1; day <= maxDays; day++) {
      const status = getStatus(habitId, day);
      if (status === 1) successCount++;
    }
    
    return maxDays > 0 ? (successCount / maxDays) * 100 : 0;
  };

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
      >
        <p className="text-lg">No habits yet.</p>
        <p className="text-sm mt-1">Add your first habit to start tracking!</p>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[200px] border-b border-border">
                {monthName} {year}
              </th>
              {days.map((day) => {
                const date = new Date(year, month, day);
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <th
                    key={day}
                    className={cn(
                      "px-1 py-2 text-center border-b border-border",
                      isCurrentMonth && day === todayDay
                        ? "text-primary font-semibold"
                        : isWeekend
                        ? "text-muted-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <div className="text-[10px] opacity-60">{dayName}</div>
                          <div className="text-xs font-mono">{day}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{date.toLocaleDateString("en-US", { 
                          weekday: "long", 
                          month: "long", 
                          day: "numeric" 
                        })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                );
              })}
              <th className="px-2 py-2 border-b border-border w-10" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {habits.map((habit, index) => {
                const stats = habitStats.get(habit.id);
                const monthlyCompletion = getMonthlyCompletion(habit.id);
                
                return (
                  <motion.tr
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-card/50 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-background group-hover:bg-card/50 transition-colors px-3 py-2 border-b border-border">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <motion.span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit.color_hex }}
                            animate={{ 
                              boxShadow: stats?.currentStreak && stats.currentStreak > 0 
                                ? `0 0 8px ${habit.color_hex}` 
                                : "none" 
                            }}
                          />
                          <span className="text-sm font-medium truncate max-w-[100px]">
                            {habit.title}
                          </span>
                          {stats && stats.currentStreak > 0 && (
                            <StreakBadge streak={stats.currentStreak} />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={monthlyCompletion} 
                            className="h-1 w-20"
                            style={{
                              // @ts-ignore - custom CSS property
                              "--progress-color": habit.color_hex,
                            }}
                          />
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {Math.round(monthlyCompletion)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    {days.map((day) => {
                      const isFuture = isCurrentMonth && day > todayDay;
                      
                      return (
                        <td key={day} className="px-1 py-2 border-b border-border">
                          <div className="flex justify-center">
                            {isFuture ? (
                              <div className="w-6 h-6 rounded-sm border border-border/30 bg-muted/20" />
                            ) : (
                              <HabitCell
                                status={getStatus(habit.id, day)}
                                colorHex={habit.color_hex}
                                day={day}
                                isToday={isCurrentMonth && day === todayDay}
                                onClick={() => handleCellClick(habit.id, day)}
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 border-b border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteHabit(habit.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

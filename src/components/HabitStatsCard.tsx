import { motion } from "framer-motion";
import { Flame, Trophy, TrendingUp, Calendar } from "lucide-react";
import { Habit, HabitLog } from "@/hooks/useHabits";
import { calculateHabitStats, HabitStats } from "@/lib/streakUtils";

interface HabitStatsCardProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function HabitStatsCard({ habits, logs }: HabitStatsCardProps) {
  // Calculate aggregated stats
  const allStats = habits.map((habit) => calculateHabitStats(habit.id, logs));
  
  const totalCurrentStreak = allStats.reduce((sum, s) => sum + s.currentStreak, 0);
  const maxLongestStreak = Math.max(...allStats.map((s) => s.longestStreak), 0);
  const avgCompletionRate =
    allStats.length > 0
      ? allStats.reduce((sum, s) => sum + s.completionRate, 0) / allStats.length
      : 0;
  const totalSuccesses = allStats.reduce((sum, s) => sum + s.totalSuccesses, 0);

  const stats = [
    {
      icon: Flame,
      label: "Active Streaks",
      value: totalCurrentStreak,
      suffix: "days",
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      icon: Trophy,
      label: "Best Streak",
      value: maxLongestStreak,
      suffix: "days",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: Math.round(avgCompletionRate),
      suffix: "%",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Calendar,
      label: "Total Wins",
      value: totalSuccesses,
      suffix: "",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${stat.bgColor} transition-transform group-hover:scale-110`}
            >
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={stat.value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-bold tabular-nums"
                >
                  {stat.value}
                </motion.span>
                {stat.suffix && (
                  <span className="text-xs text-muted-foreground">{stat.suffix}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

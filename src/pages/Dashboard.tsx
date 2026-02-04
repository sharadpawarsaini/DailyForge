import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Target, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/hooks/useHabits";
import { HabitGrid } from "@/components/HabitGrid";
import { MonthlyChart } from "@/components/MonthlyChart";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { MonthSelector } from "@/components/MonthSelector";
import { HabitStatsCard } from "@/components/HabitStatsCard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { habits, logs, loading, addHabit, deleteHabit, updateLog, fetchLogs } = useHabits();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    fetchLogs(year, month);
  }, [year, month, fetchLogs]);

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleCellClick = (habitId: string, date: string, newStatus: number) => {
    updateLog(habitId, date, newStatus);
  };

  const handleAddHabit = (title: string, color: string) => {
    addHabit(title, color);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-sm text-muted-foreground">Loading your habits...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
      >
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Target className="h-5 w-5 text-primary" />
            </motion.div>
            <h1 className="text-lg font-semibold">Habit Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Stats Cards */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HabitStatsCard habits={habits} logs={logs} />
          </motion.div>
        )}

        {/* Chart Section */}
        <MonthlyChart habits={habits} logs={logs} year={year} month={month} />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <MonthSelector year={year} month={month} onChange={handleMonthChange} />
          <AddHabitDialog onAdd={handleAddHabit} />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-neutral" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-success glow-success" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-fail glow-fail" />
            <span>Fail</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-primary/80">Click cells to track progress!</span>
          </div>
        </motion.div>

        {/* Habit Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border border-border overflow-hidden"
        >
          <HabitGrid
            habits={habits}
            logs={logs}
            year={year}
            month={month}
            onCellClick={handleCellClick}
            onDeleteHabit={deleteHabit}
          />
        </motion.div>
      </main>
    </div>
  );
}
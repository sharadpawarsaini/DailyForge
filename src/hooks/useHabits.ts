import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  color_hex: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  status: number; // 0 = neutral, 1 = success, 2 = fail
  created_at: string;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching habits:", error);
      return;
    }

    setHabits(data || []);
  }, [user]);

  const fetchLogs = useCallback(async (year: number, month: number) => {
    if (!user) return;

    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("habit_logs")
      .select("*")
      .gte("log_date", startDate)
      .lte("log_date", endDate);

    if (error) {
      console.error("Error fetching logs:", error);
      return;
    }

    setLogs(data || []);
  }, [user]);

  const addHabit = async (title: string, color_hex: string = "#00ff9d") => {
    if (!user) return null;

    const newHabitData = {
      user_id: user.id,
      title,
      color_hex,
    };

    // Optimistic update
    const tempId = crypto.randomUUID();
    const optimisticHabit = { ...newHabitData, id: tempId, created_at: new Date().toISOString() } as Habit;
    setHabits((prev) => [...prev, optimisticHabit]);

    const { data, error } = await supabase
      .from("habits")
      .insert([newHabitData])
      .select()
      .single();

    if (error) {
      console.error("Error adding habit:", error);
      // Rollback optimistic update
      setHabits((prev) => prev.filter((h) => h.id !== tempId));
      return null;
    }

    // Replace temp with real data
    setHabits((prev) => prev.map((h) => (h.id === tempId ? data : h)));
    return data;
  };

  const deleteHabit = async (habitId: string) => {
    // Optimistic update
    const previousHabits = [...habits];
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setLogs((prev) => prev.filter((l) => l.habit_id !== habitId));

    const { error } = await supabase.from("habits").delete().eq("id", habitId);

    if (error) {
      console.error("Error deleting habit:", error);
      // Rollback
      setHabits(previousHabits);
    }
  };

  const updateLog = async (habitId: string, date: string, newStatus: number) => {
    // Find existing log
    const existingLog = logs.find(
      (l) => l.habit_id === habitId && l.log_date === date
    );

    // Optimistic update
    if (existingLog) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === existingLog.id ? { ...l, status: newStatus } : l
        )
      );
    } else {
      const tempId = crypto.randomUUID();
      const newLog: HabitLog = {
        id: tempId,
        habit_id: habitId,
        log_date: date,
        status: newStatus,
        created_at: new Date().toISOString(),
      };
      setLogs((prev) => [...prev, newLog]);
    }

    // Upsert to database
    const { data, error } = await supabase
      .from("habit_logs")
      .upsert(
        {
          habit_id: habitId,
          log_date: date,
          status: newStatus,
        },
        {
          onConflict: "habit_id,log_date",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating log:", error);
      // Could rollback here if needed
      return;
    }

    // Update with real data
    if (existingLog) {
      setLogs((prev) =>
        prev.map((l) => (l.habit_id === habitId && l.log_date === date ? data : l))
      );
    } else {
      setLogs((prev) =>
        prev.map((l) =>
          l.habit_id === habitId && l.log_date === date && l.id !== data.id
            ? data
            : l.habit_id === habitId && l.log_date === date
            ? data
            : l
        )
      );
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      const now = new Date();
      Promise.all([fetchHabits(), fetchLogs(now.getFullYear(), now.getMonth())]).then(
        () => setLoading(false)
      );
    } else {
      setHabits([]);
      setLogs([]);
      setLoading(false);
    }
  }, [user, fetchHabits, fetchLogs]);

  return {
    habits,
    logs,
    loading,
    addHabit,
    deleteHabit,
    updateLog,
    fetchLogs,
  };
}

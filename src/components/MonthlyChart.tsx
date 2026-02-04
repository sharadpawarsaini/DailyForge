import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Habit, HabitLog } from "@/hooks/useHabits";

interface MonthlyChartProps {
  habits: Habit[];
  logs: HabitLog[];
  year: number;
  month: number;
}

export function MonthlyChart({ habits, logs, year, month }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;
    const data = [];

    for (let day = 1; day <= maxDay; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      let successCount = 0;
      let totalTracked = 0;

      habits.forEach((habit) => {
        const log = logs.find((l) => l.habit_id === habit.id && l.log_date === dateStr);
        if (log && log.status !== 0) {
          totalTracked++;
          if (log.status === 1) {
            successCount++;
          }
        }
      });

      const percentage = totalTracked > 0 ? Math.round((successCount / totalTracked) * 100) : null;

      data.push({
        day,
        percentage,
        displayPercentage: percentage ?? 0,
      });
    }

    return data;
  }, [habits, logs, year, month]);

  const averageSuccess = useMemo(() => {
    const validDays = chartData.filter((d) => d.percentage !== null);
    if (validDays.length === 0) return 0;
    return Math.round(validDays.reduce((sum, d) => sum + (d.percentage ?? 0), 0) / validDays.length);
  }, [chartData]);

  // Calculate trend (last 7 days vs previous 7 days)
  const trend = useMemo(() => {
    const recentDays = chartData.slice(-7).filter(d => d.percentage !== null);
    const previousDays = chartData.slice(-14, -7).filter(d => d.percentage !== null);
    
    if (recentDays.length === 0) return 0;
    
    const recentAvg = recentDays.reduce((sum, d) => sum + (d.percentage ?? 0), 0) / recentDays.length;
    const previousAvg = previousDays.length > 0 
      ? previousDays.reduce((sum, d) => sum + (d.percentage ?? 0), 0) / previousDays.length 
      : recentAvg;
    
    return Math.round(recentAvg - previousAvg);
  }, [chartData]);

  if (habits.length === 0) {
    return null;
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-card rounded-lg border border-border p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Monthly Success Rate</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily completion percentage
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <motion.span
              key={averageSuccess}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-primary"
            >
              {averageSuccess}%
            </motion.span>
            {chartData.length > 7 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-0.5 text-xs ${trendColor}`}
              >
                <TrendIcon className="w-3 h-3" />
                <span>{Math.abs(trend)}%</span>
              </motion.div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">avg</p>
        </div>
      </div>
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(156, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(156, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }}
              interval={4}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(0, 0%, 55%)" }}
              width={25}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 6%)",
                border: "1px solid hsl(0, 0%, 12%)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(0, 0%, 95%)" }}
              formatter={(value: number) => [`${value}%`, "Success"]}
              labelFormatter={(day) => `Day ${day}`}
            />
            <Area
              type="monotone"
              dataKey="displayPercentage"
              stroke="hsl(156, 100%, 50%)"
              strokeWidth={2}
              fill="url(#successGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "hsl(156, 100%, 50%)",
                stroke: "hsl(0, 0%, 4%)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({ streak, showLabel = false, size = "sm" }: StreakBadgeProps) {
  if (streak === 0) return null;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-1 gap-1",
    lg: "text-base px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const getStreakColor = () => {
    if (streak >= 30) return "from-orange-500 to-red-500";
    if (streak >= 14) return "from-orange-400 to-orange-500";
    if (streak >= 7) return "from-yellow-400 to-orange-400";
    return "from-yellow-300 to-yellow-400";
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        `bg-gradient-to-r ${getStreakColor()} text-black`,
        sizeClasses[size]
      )}
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 1, 1.1, 1],
        }}
        transition={{ 
          duration: 0.5, 
          repeat: Infinity, 
          repeatDelay: 2,
        }}
      >
        <Flame className={iconSizes[size]} />
      </motion.div>
      <span className="font-bold tabular-nums">{streak}</span>
      {showLabel && <span className="ml-0.5">day{streak !== 1 ? "s" : ""}</span>}
    </motion.div>
  );
}

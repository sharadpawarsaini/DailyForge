import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HabitCellProps {
  status: number; // 0 = neutral, 1 = success, 2 = fail
  colorHex?: string;
  onClick: () => void;
  day: number;
  isToday?: boolean;
}

export function HabitCell({ status, colorHex = "#00ff9d", onClick, day, isToday }: HabitCellProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 1: // Success
        return {
          backgroundColor: colorHex,
          className: "glow-success",
        };
      case 2: // Fail
        return {
          backgroundColor: "hsl(350, 90%, 60%)",
          className: "glow-fail",
        };
      default: // Neutral
        return {
          backgroundColor: "hsl(0, 0%, 16%)",
          className: "",
        };
    }
  };

  const { backgroundColor, className } = getStatusStyles();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      animate={status === 1 ? { 
        boxShadow: [
          `0 0 0px ${colorHex}40`,
          `0 0 16px ${colorHex}60`,
          `0 0 0px ${colorHex}40`,
        ],
      } : {}}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        scale: {
          duration: 0.15,
        }
      }}
      className={cn(
        "w-6 h-6 rounded-sm border border-border",
        "focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
        "cursor-pointer relative",
        isToday && "ring-1 ring-primary/50",
        className
      )}
      style={{ backgroundColor }}
      title={`Day ${day}: ${status === 0 ? "Neutral" : status === 1 ? "Success" : "Fail"}`}
      aria-label={`Day ${day}, Status: ${status === 0 ? "Neutral" : status === 1 ? "Success" : "Fail"}. Click to cycle.`}
    >
      {/* Ripple effect on success */}
      {status === 1 && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-sm"
          style={{ backgroundColor: colorHex }}
        />
      )}
    </motion.button>
  );
}

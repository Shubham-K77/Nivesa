"use client";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
const BarLoader = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return (
    <Progress
      value={progress}
      className="w-[95%] rounded-xl mt-4 bg-white/15 [&>div]:bg-amber-400/80"
    />
  );
};

export default BarLoader;
